var assert = require('chai').assert;
var parseCert = require('../').parseCert;
var should = require('should');

var certificate = 
    '-----BEGIN CERTIFICATE-----\n' +
  'MIIFRTCCBC2gAwIBAgIHJ6yuMLnzIzANBgkqhkiG9w0BAQUFADCByjELMAkGA1UE\n' +
  'BhMCVVMxEDAOBgNVBAgTB0FyaXpvbmExEzARBgNVBAcTClNjb3R0c2RhbGUxGjAY\n' +
  'BgNVBAoTEUdvRGFkZHkuY29tLCBJbmMuMTMwMQYDVQQLEypodHRwOi8vY2VydGlm\n' +
  'aWNhdGVzLmdvZGFkZHkuY29tL3JlcG9zaXRvcnkxMDAuBgNVBAMTJ0dvIERhZGR5\n' +
  'IFNlY3VyZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTERMA8GA1UEBRMIMDc5Njky\n' +
  'ODcwHhcNMTMwNDI2MTQ1MTE3WhcNMTQwNDI2MTQ1MTE3WjA9MSEwHwYDVQQLExhE\n' +
  'b21haW4gQ29udHJvbCBWYWxpZGF0ZWQxGDAWBgNVBAMTD3d3dy5hY2FsaW5lLmNv\n' +
  'bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ9t6lDUaTlQiRZF8V5\n' +
  'x9/IpwPO3hjVzApA20GysXt5r/VZ+blSgkt42NQUdQYNXX5E1H42CtAwg8giLqw6\n' +
  '2aEkHLQ3aFXMmcMktCU+//vm3cMD5ShKRKxxY9azlQ1AYIUXJJJgK79o1vTCp62A\n' +
  'oQaR5dEcyn6jkR7s35j5lG+rNRk9VtcSntiqFUX6HcokIvHffpl6YWtAbZigfm6w\n' +
  '7sElt7bgD+jlh53mF9v2EpbQaLsVKaMaHLlbgeG4Oww+AwWnpfUmBFHik2T3RE94\n' +
  'WxqklUCYDNsvNLTQwa34dDI0JbUI1ExLC7lo0+fJgCnLf3U3avsUbuo+8nmSVLhd\n' +
  'zkcCAwEAAaOCAbowggG2MA8GA1UdEwEB/wQFMAMBAQAwHQYDVR0lBBYwFAYIKwYB\n' +
  'BQUHAwEGCCsGAQUFBwMCMA4GA1UdDwEB/wQEAwIFoDAzBgNVHR8ELDAqMCigJqAk\n' +
  'hiJodHRwOi8vY3JsLmdvZGFkZHkuY29tL2dkczEtOTAuY3JsMFMGA1UdIARMMEow\n' +
  'SAYLYIZIAYb9bQEHFwEwOTA3BggrBgEFBQcCARYraHR0cDovL2NlcnRpZmljYXRl\n' +
  'cy5nb2RhZGR5LmNvbS9yZXBvc2l0b3J5LzCBgAYIKwYBBQUHAQEEdDByMCQGCCsG\n' +
  'AQUFBzABhhhodHRwOi8vb2NzcC5nb2RhZGR5LmNvbS8wSgYIKwYBBQUHMAKGPmh0\n' +
  'dHA6Ly9jZXJ0aWZpY2F0ZXMuZ29kYWRkeS5jb20vcmVwb3NpdG9yeS9nZF9pbnRl\n' +
  'cm1lZGlhdGUuY3J0MB8GA1UdIwQYMBaAFP2sYTKTbEXW4u6FX5q653aZaMznMCcG\n' +
  'A1UdEQQgMB6CD3d3dy5hY2FsaW5lLmNvbYILYWNhbGluZS5jb20wHQYDVR0OBBYE\n' +
  'FOZhFE5aS1EMTmxePHlhZdS9ZJS+MA0GCSqGSIb3DQEBBQUAA4IBAQBWtSoAXqwS\n' +
  'lGHM199r4mZ8aPBgPEm8IJipk/qR4sbcSu2GdCChxpyu459tIUhOh+/noHc1Ubfx\n' +
  '+e7W96kX1HMQETYSC8FWn6LVTURRWwA/NIqM4AEGO+d3qwwchmw6pZX7R3+4DZ8f\n' +
  '3IjOuovhqGt0EJEPRKqzbFzrjFCoRYpgn52aijBdZGLJaPvZOKT5fJ6ntsbgO0xK\n' +
  'dd9L2ODL/CJzS/RRRhO0k76vCq88kX1pham8yXH6mYLcCrUcWY1HcgC/y/5EESWH\n' +
  'Y5+UfLaeUH5QU3Wtg2qwo5fUDG8ox8PlNXKEs6u38/x84GKJdOmpzAP8/a/HPECM\n' +
  'S0cBxC+UItcO\n' +
  '-----END CERTIFICATE-----\n';


describe('parseCert', function() {

  it('should correctly parse certificate', function() {
    var out = parseCert(certificate);
    assert.deepEqual(out, 
      { publicModulus: 'B27DB7A94351A4E542245917C579C7DFC8A703CEDE18D5CC0A40DB41B2B17B79AFF559F9B952824B78D8D41475060D5D7E44D47E360AD03083C8222EAC3AD9A1241CB4376855CC99C324B4253EFFFBE6DDC303E5284A44AC7163D6B3950D406085172492602BBF68D6F4C2A7AD80A10691E5D11CCA7EA3911EECDF98F9946FAB35193D56D7129ED8AA1545FA1DCA2422F1DF7E997A616B406D98A07E6EB0EEC125B7B6E00FE8E5879DE617DBF61296D068BB1529A31A1CB95B81E1B83B0C3E0305A7A5F5260451E29364F7444F785B1AA49540980CDB2F34B4D0C1ADF874323425B508D44C4B0BB968D3E7C98029CB7F75376AFB146EEA3EF2799254B85DCE47',
        publicExponent: '010001',
        subject: 
         { commonName: 'www.acaline.com',
           organizationalUnitName: 'Domain Control Validated' },
        issuer: 
         { commonName: 'Go Daddy Secure Certification Authority',
           countryName: 'US',
           localityName: 'Scottsdale',
           organizationName: 'GoDaddy.com, Inc.',
           organizationalUnitName: 'http://certificates.godaddy.com/repository',
           serialNumber: '07969287',
           stateOrProvinceName: 'Arizona' },
        serial: '27ACAE30B9F323',
        notBefore: 'Apr 26 14:51:17 2013 GMT',
        notAfter: 'Apr 26 14:51:17 2014 GMT',
        altNames: [ 'www.acaline.com', 'acaline.com' ],
        ocspList: [ 'http://ocsp.godaddy.com/' ] });
  });

  it('should throw exception on bad data', function() {
    try {
      parseCert("FOO");
      assert(false, "Should have thrown exception");
    } catch(exc) {
      exc.message.should.equal('Unable to parse')
    }
  });

});