const CryptoJS = require('crypto-js');

const generateKeyPair = () => {
  try {
    // Generate a random private key
    const privateKey = CryptoJS.lib.WordArray.random(32).toString();
    // Generate public key from private key
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    return { privateKey, publicKey };
  } catch (error) {
    console.error('Error generating key pair:', error);
    throw error;
  }
};

const encryptVote = (vote, publicKey) => {
  try {
    if (!vote || !publicKey) {
      throw new Error('Vote and public key are required for encryption');
    }
    // Convert vote to string and encrypt
    const voteString = vote.toString();
    return CryptoJS.AES.encrypt(voteString, publicKey).toString();
  } catch (error) {
    console.error('Error encrypting vote:', error);
    throw error;
  }
};

const decryptVote = (encryptedVote, privateKey) => {
  try {
    if (!encryptedVote || !privateKey) {
      throw new Error('Encrypted vote and private key are required for decryption');
    }
    // Decrypt the vote
    const bytes = CryptoJS.AES.decrypt(encryptedVote, privateKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Failed to decrypt vote');
    }
    
    return decryptedText;
  } catch (error) {
    console.error('Error decrypting vote:', error);
    throw error;
  }
};

module.exports = {
  generateKeyPair,
  encryptVote,
  decryptVote
}; 