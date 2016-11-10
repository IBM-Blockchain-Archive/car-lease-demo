
var readCertAttribute = function(x509cert, attr) {

  var attrNames = parseAttributeHeader(x509cert.extensions["1.2.3.4.5.6.9"]);

  if (attrNames == null) {
    return null;
  }

  return getAttributeValueByIndex(x509cert, attrNames[attr]);
}

function parseAttributeHeader(header) {

  if (typeof header === 'undefined') {
    return null;
  }

  if (header.indexOf("00HEAD") != 0) {
    console.log("Invalid header");
    return null;
  }

  header = header.substring(6);

  var tokens = header.split('#');
  var attrNames = {};

  for (var i = 0; i < tokens.length; i++) {
    var pair = tokens[i].split('->');
    attrNames[pair[0]] = pair[1];
  }

  return attrNames;
}

function getAttributeValueByIndex(x509cert, index) {

  var attrId = "1.2.3.4.5.6." + (9 + parseInt(index));
  
  return x509cert.extensions[attrId];
}

exports.readCertAttribute = readCertAttribute;
