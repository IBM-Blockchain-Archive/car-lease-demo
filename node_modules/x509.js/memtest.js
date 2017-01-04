var x509 = require('./');


try {
var parsed = x509.parseCert("AAA");
} catch(err) {}

console.log("1", x509.info());

try {
x509.parseCert("BBB");
} catch(err) {}

console.log("2", x509.info());

try {
x509.parseCert("CCC");
} catch(err) {}

console.log("3", x509.info());

try {
x509.parseCert("DDD");
} catch(err) {}
console.log("4", x509.info());


var cert= '-----BEGIN CERTIFICATE-----\n' +
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

x509.parseCert(cert);

console.log("5", x509.info());

x509.parseCert(cert);

console.log("6", x509.info());

x509.parseCert(cert);

console.log("7", x509.info());

var str = "CCC";
for(var i = 0;i < 5;++i)
  str = str + str;


for(var i = 8;i <= 20;++i) {
  try {
  x509.parseCert(str);
  } catch(err) {}

  console.log(i, x509.info());
}