import CryptoJS from 'crypto-js';

export const generateKeyPair = () => {
  try {
    const privateKey = CryptoJS.lib.WordArray.random(16).toString();
    const publicKey = CryptoJS.SHA256(privateKey).toString();
    return { privateKey, publicKey };
  } catch (error) {
    console.error('Error generating key pair:', error);
    throw error;
  }
};

export const encryptVote = (vote, publicKey) => {
  try {
    if (!vote || !publicKey) {
      throw new Error('Vote and public key are required for encryption');
    }
    return CryptoJS.AES.encrypt(vote, publicKey).toString();
  } catch (error) {
    console.error('Error encrypting vote:', error);
    throw error;
  }
};

export const decryptVote = (encryptedVote, privateKey) => {
  try {
    if (!encryptedVote || !privateKey) {
      throw new Error('Encrypted vote and private key are required for decryption');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedVote, privateKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error decrypting vote:', error);
    throw error;
  }
}; 