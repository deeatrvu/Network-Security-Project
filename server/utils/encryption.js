const CryptoJS = require('crypto-js');

const generateKeyPair = () => {
  // In a real implementation, use a proper asymmetric encryption library
  // This is a simplified version for demonstration
  const privateKey = CryptoJS.lib.WordArray.random(16).toString();
  const publicKey = CryptoJS.SHA256(privateKey).toString();
  return { privateKey, publicKey };
};

const encryptVote = (vote, publicKey) => {
  return CryptoJS.AES.encrypt(vote, publicKey).toString();
};

const decryptVote = (encryptedVote, privateKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedVote, privateKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  generateKeyPair,
  encryptVote,
  decryptVote
}; 