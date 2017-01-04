var assert = require('chai').assert;
var parseKey = require('../').parseKey;
var should = require('should');

var pem = 
  '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpAIBAAKCAQEA5sW8hM95zG7bGh9+0M4576QTOVwFWIZgWrZuLeHAsxyNHBL0\n' +
    'Nv0iLBZ93kSSj3L3Lf6eVCD9BZWDbUehY8xZocRErujA6c47ilPS/NVppK2jjVN+\n' +
    'NULIH4h1OOa2qVPYKtxhULiLCelh5FHXIYlQAqBiik9zh+PZnteOBayU9WQGmNgz\n' +
    'vFGM71ohkrL1j7eb1vH0mfpgPJo9tK2O9uq0Bx0ly8KkH5zIuh1HuRNarlPtR5sA\n' +
    '8JxAtGBydP6kWF5h1UHbKXM283PfHbVprUHRfRoE767XqZOPZRxxqpnAxNS/tjR8\n' +
    'zpBGmxKiPwS90y20Bm2yLnV9VycrrWSFqfYdHQIDAQABAoIBAQC97tL48BYLxtV3\n' +
    'y6JBUupmLMFRvUX9FSPqpSlLg/losUAGcicjtvVQGfbgX8nMXM/JwD0perkkxmiU\n' +
    'IZdYHxFKTdJFrvVPuVhRwintw+weCHeK0sQWK++v3Ey2V1TRSluo8xb5K9nrf3T9\n' +
    'SMpqJKyAbOaNdVTd7A7pZ/nQ+7jhuTAZlW1SnjJ2mkOML5UbM7Ncf7X92tfC/KNQ\n' +
    'afxW4VHxyNLDN5m9Qjq42Tlela+kFEJr7yosd7OLsH7XoiOnPHV1qYO7zrLxNfJe\n' +
    'xyP3RwkbSmAJ8h8oJcZn69gP8URr/KW/B++3pHPkQVQglk+pZRogtpD89JgCUn25\n' +
    'PHNukxqBAoGBAP6dMOn4xVvQj/aLjfvDlfM4XIU3vNiEItYhs8z99PwBYfqlAdLd\n' +
    '8uNTCLBH6GBeW1zbvKRGz5bZiERTNe+8lPilzVWVd183yRMXWHIzMDBA7FpSJlRV\n' +
    'Ci5UiI6ICHR24OsJ+CN+ctPDNpg9wNtRe1ppM6a8+9zqI0tArkfE1FUhAoGBAOgH\n' +
    'UlaN7HdW/Vb/l7/WyZK15DkJx057v2WTZYdTV2sN6h1Jrsq7NOx7xNntJmk0x/Ad\n' +
    'uKOx99V/h308EWjgwa+IEduiAt0GgRXhWItn9mUWD2YlhcYmOXidyYrBDq3JyZUM\n' +
    'Ts7DEc8CV0Fs8okRVq02f7H2Z+oUvDqyYkLV6wx9AoGAc0zfz7R2O0PRTcaYv4As\n' +
    'sX2+eB1riWkdFXchox0GCfDeW9DJaKJV0ZfSgXGuy6UvHnfrj0D51Mghqz87V5tA\n' +
    'ovECcVVEP3xVtC2IQf7oPZHI9oXpEZuJBr4FMPZtTcBfzlAvbHNgsIDggkTExwy5\n' +
    'HZIyb7l5HOtynCtoQNvjg8ECgYEAvIuOjgUf/U3z6akin+IixJQH042tpooKWrku\n' +
    'zIudwsF417nTTqxXcj+VE92Q0/bu7aDJNEPe9199MvgH0aip20B/+nCpUQADD0uh\n' +
    'zw54+2W0t7WQAhd3phrZ9mWwzunlY7evpnZ/Vy84xlKIt3cebvyVQYDQqjeVSUFB\n' +
    'dbwtF2UCgYB/y+osTUFNxDqu7FX8HBlL7F3ZBjjFUs8xpZZuZKWG+7CCcSE/rPdw\n' +
    'E5sHwC0OxTWnRaiNaP5TEV/u95p9cZYQNIgrzl1ooU5ZFzl7NX6VnJfQAyA/WeCB\n' +
    '3MvNt068tqRoQpL3btfzyn7kGweDdZ0w181Y9Wyfg1Pb4tKWbZrCBw==\n' +
    '-----END RSA PRIVATE KEY-----\n';


describe('parseKey', function() {

  it('should correctly parse pem', function() {
    var out = parseKey(pem);
    assert.deepEqual(out, { 
      publicExponent: '010001',
      publicModulus: 'E6C5BC84CF79CC6EDB1A1F7ED0CE39EFA413395C055886605AB66E2DE1C0B31C8D1C12F436FD222C167DDE44928F72F72DFE9E5420FD0595836D47A163CC59A1C444AEE8C0E9CE3B8A53D2FCD569A4ADA38D537E3542C81F887538E6B6A953D82ADC6150B88B09E961E451D721895002A0628A4F7387E3D99ED78E05AC94F5640698D833BC518CEF5A2192B2F58FB79BD6F1F499FA603C9A3DB4AD8EF6EAB4071D25CBC2A41F9CC8BA1D47B9135AAE53ED479B00F09C40B4607274FEA4585E61D541DB297336F373DF1DB569AD41D17D1A04EFAED7A9938F651C71AA99C0C4D4BFB6347CCE90469B12A23F04BDD32DB4066DB22E757D57272BAD6485A9F61D1D',
    }
    );

  });

  it('should throw exception on bad data', function() {
    try {
      parseKey("FOO");
      assert(false, "Should have thrown exception");
    } catch(exc) {
      exc.message.should.equal('Unable to parse')
    }
  });

});