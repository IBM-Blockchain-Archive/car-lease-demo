

#include <openssl/asn1.h>
#include <openssl/bio.h>
#include <openssl/err.h>
#include <openssl/pem.h>
#include <openssl/x509.h>
#include <openssl/x509v3.h>

#include <map>
#include <string>
#include <vector>
#include <cstring>

#include <malloc.h>

#ifdef EMSCRIPTEN
#include <emscripten.h>
#endif

// Field names that OpenSSL is missing.
static const char *MISSING[3][2] = {
  {
    "1.3.6.1.4.1.311.60.2.1.1",
    "jurisdictionOfIncorpationLocalityName"
  },

  {
    "1.3.6.1.4.1.311.60.2.1.2",
    "jurisdictionOfIncorporationStateOrProvinceName"
  },

  {
    "1.3.6.1.4.1.311.60.2.1.3",
    "jurisdictionOfIncorporationCountryName"
  }
};


template<class T>
void put_rsa_info_to_exports(T& exports, RSA* rsa) {
  char *public_exponent = BN_bn2hex(rsa->e);
  char *public_modulus = BN_bn2hex(rsa->n);
  if(public_exponent) {
    exports.publicExponent = public_exponent;
    OPENSSL_free(public_exponent);
  }
  if(public_modulus) {
    exports.publicModulus = public_modulus;
    OPENSSL_free(public_modulus);
  }
}

struct parsed_name : public std::map<std::string, std::string> {

  std::string get(std::string key) {
    auto it = find(key);
    if(it == end())
      return "";
    return it->second;
  }

  std::vector<std::string> keys() {
    std::vector<std::string> allKeys;
    allKeys.reserve(size());
    for(auto it = begin();it != end();++it) {
      allKeys.push_back(it->first);
    }
    return allKeys;
  }
};

// Fix for missing fields in OpenSSL.
std::string real_name(const char *data) {
  int i, length = (int) sizeof(MISSING) / sizeof(MISSING[0]);

  for (i = 0; i < length; i++) {
    if (strcmp(data, MISSING[i][0]) == 0)
      return MISSING[i][1];
  }
  return data;
}
parsed_name parse_name(X509_NAME *subject) {
  parsed_name result;

  int i, length;
  ASN1_OBJECT *entry;
  char buf[256] = {0,};
  length = X509_NAME_entry_count(subject);
  for (i = 0; i < length; i++) {
    entry = X509_NAME_ENTRY_get_object(X509_NAME_get_entry(subject, i));
    OBJ_obj2txt(buf, 255, entry, 0);
    auto value = ASN1_STRING_data(X509_NAME_ENTRY_get_data(X509_NAME_get_entry(subject, i)));
     result[real_name(buf)] = (char*)value;
  }
  return result;
}


std::string parse_date(ASN1_TIME *date) {
  char formatted[128];
  memset(formatted, 0, sizeof(formatted));
  
  BIO *bio = BIO_new(BIO_s_mem());
  ASN1_TIME_print(bio, date);

  BUF_MEM *bm = nullptr;
  BIO_get_mem_ptr (bio, &bm);
  //if(bm && bm->data)

  memcpy(formatted, bm->data, std::min(bm->length, sizeof(formatted)-1));
    
  BIO_free (bio);
  return formatted;
}

std::string parse_serial(ASN1_INTEGER *serial) {
  BIGNUM *bn = ASN1_INTEGER_to_BN(serial, NULL);
  char *hex = BN_bn2hex(bn);

  std::string serialNumber = hex;
  BN_free(bn);
  OPENSSL_free(hex);
  return serialNumber;
}

struct parsed_cert {
  std::string error;
  std::string publicModulus;
  std::string publicExponent;
  parsed_name subject;
  parsed_name issuer;
  std::string serial;
  std::string notBefore;
  std::string notAfter;
  std::vector<std::string> altNames;
  std::vector<std::string> ocspList;
};

int info() {
  struct mallinfo info = mallinfo();
  return info.uordblks;
}

/*
 * This is where everything is handled for both -0.11.2 and 0.11.3+.
 */
parsed_cert parse_cert(std::string dataString) {
  const char* data = dataString.c_str();

  parsed_cert parsedCert;
  BIO *bio = BIO_new_mem_buf((void*)data, dataString.length());

  X509 *cert = PEM_read_bio_X509(bio, NULL, 0, NULL);
  if (cert == NULL) {
    BIO_free(bio);
    parsedCert.error = "Unable to parse";
    return parsedCert;
  }

  EVP_PKEY *pkey = X509_get_pubkey(cert);
  if(pkey) {
    RSA *rsa_public_key = NULL;
    rsa_public_key = EVP_PKEY_get1_RSA(pkey);
    if(rsa_public_key) {
      put_rsa_info_to_exports(parsedCert, rsa_public_key);
      RSA_free(rsa_public_key);
    }
    EVP_PKEY_free(pkey);
  }
  

  parsedCert.subject =  parse_name(X509_get_subject_name(cert));
  parsedCert.issuer = parse_name(X509_get_issuer_name(cert));
  parsedCert.serial = parse_serial(X509_get_serialNumber(cert));
  parsedCert.notBefore = parse_date(X509_get_notBefore(cert));
  parsedCert.notAfter = parse_date(X509_get_notAfter(cert));

  // get OCSP urls (if available)
  {
    STACK_OF(OPENSSL_STRING) *ocsplst;
    ocsplst = X509_get1_ocsp(cert);
    for (int j = 0; j < sk_OPENSSL_STRING_num(ocsplst); j++) {
      parsedCert.ocspList.push_back(sk_OPENSSL_STRING_value(ocsplst, j));
    }
    X509_email_free(ocsplst);
  }


  STACK_OF(GENERAL_NAME) *names = NULL;

  names = (STACK_OF(GENERAL_NAME)*) X509_get_ext_d2i(cert, NID_subject_alt_name, NULL, NULL);
  if (names != NULL) {
    int length = sk_GENERAL_NAME_num(names);
    for (int i = 0; i < length; i++) {
      GENERAL_NAME *current = sk_GENERAL_NAME_value(names, i);

      if (current->type == GEN_DNS) {
        char *name = (char*) ASN1_STRING_data(current->d.dNSName);

        if (ASN1_STRING_length(current->d.dNSName) != (int) strlen(name)) {
          parsedCert.error = "Malformed alternative names field.";
        }
        parsedCert.altNames.push_back(name);
      }
      
    }
  }
  sk_GENERAL_NAME_pop_free(names, GENERAL_NAME_free); // http://stackoverflow.com/a/15876197/403571

  X509_free(cert);
  BIO_free(bio);

  return parsedCert;
}

struct parsed_key {
  std::string error;
  std::string publicModulus;
  std::string publicExponent;
};

parsed_key parse_key(const std::string& dataString) {
  const char* data = dataString.c_str();

  parsed_key parsedKey;

  BIO *bio = BIO_new(BIO_s_mem());
  int result = BIO_puts(bio, data);

  RSA *private_key = NULL;

  private_key = PEM_read_bio_RSAPrivateKey(bio, NULL, NULL, (void*)"");
  if(private_key) {
    put_rsa_info_to_exports(parsedKey, private_key);
    RSA_free(private_key);
  } else {
    parsedKey.error = "Unable to parse";
  }

  BIO_free(bio);
  return parsedKey;
}

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(main) {
    emscripten::function("parseCert", &parse_cert);
    emscripten::function("parseKey", &parse_key);
    emscripten::function("info", &info);

    emscripten::register_vector<std::string>("StringList");
    emscripten::class_<parsed_name>("ParsedName")
      .function("keys", &parsed_name::keys)
      .function("get", &parsed_name::get)
    ;

    emscripten::value_object<parsed_cert>("ParsedCert")
      .field("publicModulus", &parsed_cert::publicModulus)
      .field("publicExponent", &parsed_cert::publicExponent)
      .field("subject", &parsed_cert::subject)
      .field("issuer", &parsed_cert::issuer)
      .field("serial", &parsed_cert::serial)
      .field("notBefore", &parsed_cert::notBefore)
      .field("notAfter", &parsed_cert::notAfter)
      .field("altNames", &parsed_cert::altNames)
      .field("ocspList", &parsed_cert::ocspList)
      .field("error", &parsed_cert::error)
    ;
  

      ;

  emscripten::value_object<parsed_key>("ParsedPem")
      .field("publicModulus", &parsed_key::publicModulus)
      .field("publicExponent", &parsed_key::publicExponent)
      .field("error", &parsed_key::error)
    ;

}

#endif


#ifdef TEST
int main(void)
{

  
  for(auto i = 0;i < 10000;++i) {

    parse_cert(
      "-----BEGIN CERTIFICATE-----\n" \
    "MIIFRTCCBC2gAwIBAgIHJ6yuMLnzIzANBgkqhkiG9w0BAQUFADCByjELMAkGA1UE\n" \
    "BhMCVVMxEDAOBgNVBAgTB0FyaXpvbmExEzARBgNVBAcTClNjb3R0c2RhbGUxGjAY\n" \
    "BgNVBAoTEUdvRGFkZHkuY29tLCBJbmMuMTMwMQYDVQQLEypodHRwOi8vY2VydGlm\n" \
    "aWNhdGVzLmdvZGFkZHkuY29tL3JlcG9zaXRvcnkxMDAuBgNVBAMTJ0dvIERhZGR5\n" \
    "IFNlY3VyZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTERMA8GA1UEBRMIMDc5Njky\n" \
    "ODcwHhcNMTMwNDI2MTQ1MTE3WhcNMTQwNDI2MTQ1MTE3WjA9MSEwHwYDVQQLExhE\n" \
    "b21haW4gQ29udHJvbCBWYWxpZGF0ZWQxGDAWBgNVBAMTD3d3dy5hY2FsaW5lLmNv\n" \
    "bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ9t6lDUaTlQiRZF8V5\n" \
    "x9/IpwPO3hjVzApA20GysXt5r/VZ+blSgkt42NQUdQYNXX5E1H42CtAwg8giLqw6\n" \
    "2aEkHLQ3aFXMmcMktCU+//vm3cMD5ShKRKxxY9azlQ1AYIUXJJJgK79o1vTCp62A\n" \
    "oQaR5dEcyn6jkR7s35j5lG+rNRk9VtcSntiqFUX6HcokIvHffpl6YWtAbZigfm6w\n" \
    "7sElt7bgD+jlh53mF9v2EpbQaLsVKaMaHLlbgeG4Oww+AwWnpfUmBFHik2T3RE94\n" \
    "WxqklUCYDNsvNLTQwa34dDI0JbUI1ExLC7lo0+fJgCnLf3U3avsUbuo+8nmSVLhd\n" \
    "zkcCAwEAAaOCAbowggG2MA8GA1UdEwEB/wQFMAMBAQAwHQYDVR0lBBYwFAYIKwYB\n" \
    "BQUHAwEGCCsGAQUFBwMCMA4GA1UdDwEB/wQEAwIFoDAzBgNVHR8ELDAqMCigJqAk\n" \
    "hiJodHRwOi8vY3JsLmdvZGFkZHkuY29tL2dkczEtOTAuY3JsMFMGA1UdIARMMEow\n" \
    "SAYLYIZIAYb9bQEHFwEwOTA3BggrBgEFBQcCARYraHR0cDovL2NlcnRpZmljYXRl\n" \
    "cy5nb2RhZGR5LmNvbS9yZXBvc2l0b3J5LzCBgAYIKwYBBQUHAQEEdDByMCQGCCsG\n" \
    "AQUFBzABhhhodHRwOi8vb2NzcC5nb2RhZGR5LmNvbS8wSgYIKwYBBQUHMAKGPmh0\n" \
    "dHA6Ly9jZXJ0aWZpY2F0ZXMuZ29kYWRkeS5jb20vcmVwb3NpdG9yeS9nZF9pbnRl\n" \
    "cm1lZGlhdGUuY3J0MB8GA1UdIwQYMBaAFP2sYTKTbEXW4u6FX5q653aZaMznMCcG\n" \
    "A1UdEQQgMB6CD3d3dy5hY2FsaW5lLmNvbYILYWNhbGluZS5jb20wHQYDVR0OBBYE\n" \
    "FOZhFE5aS1EMTmxePHlhZdS9ZJS+MA0GCSqGSIb3DQEBBQUAA4IBAQBWtSoAXqwS\n" \
    "lGHM199r4mZ8aPBgPEm8IJipk/qR4sbcSu2GdCChxpyu459tIUhOh+/noHc1Ubfx\n" \
    "+e7W96kX1HMQETYSC8FWn6LVTURRWwA/NIqM4AEGO+d3qwwchmw6pZX7R3+4DZ8f\n" \
    "3IjOuovhqGt0EJEPRKqzbFzrjFCoRYpgn52aijBdZGLJaPvZOKT5fJ6ntsbgO0xK\n" \
    "dd9L2ODL/CJzS/RRRhO0k76vCq88kX1pham8yXH6mYLcCrUcWY1HcgC/y/5EESWH\n" \
    "Y5+UfLaeUH5QU3Wtg2qwo5fUDG8ox8PlNXKEs6u38/x84GKJdOmpzAP8/a/HPECM\n" \
    "S0cBxC+UItcO\n" \
    "-----END CERTIFICATE-----\n"
    );
}
  return 0;
}


#endif