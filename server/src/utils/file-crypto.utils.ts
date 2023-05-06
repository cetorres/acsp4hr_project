/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

// Create a unique initial vector
export function generateRandomIV(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Encrypt/decrypt text
export function encryptDecryptText(decrypt: boolean, text: string, iv: string, password: string): string {
  const ivBuffer = Buffer.from(iv, 'hex');
  const passBuffer = Buffer.from(password, 'hex');

  if (!decrypt) {
    const cipher = crypto.createCipheriv(ALGORITHM, passBuffer, ivBuffer);
    let enc_text = cipher.update(text, 'utf-8', 'hex');
    enc_text += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return enc_text + '$$' + tag.toString('hex');
  } else {
    const cipherSplit = text.split('$$');
    const ciphertext = cipherSplit[0];
    const tag = Buffer.from(cipherSplit[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, passBuffer, ivBuffer);
    decipher.setAuthTag(tag);
    let dec_text = decipher.update(ciphertext, 'hex', 'utf-8');
    dec_text += decipher.final('utf-8');
    return dec_text.toString();
  }
}

// Encrypt/decrypt file
export function encryptDecryptFile(
  decrypt: boolean,
  filePathEnc: string,
  filePathDec: string,
  iv: string,
  password: string
): boolean {
  try {
    const ivBuffer = Buffer.from(iv, 'hex');
    const passBuffer = Buffer.from(password, 'hex');

    if (!decrypt) {
      const inputFile = fs.readFileSync(filePathDec);
      const cipher = crypto.createCipheriv(ALGORITHM, passBuffer, ivBuffer, { encoding: 'base64' });
      let encrypted = Buffer.concat([cipher.update(inputFile), cipher.final()]);
      const tag = cipher.getAuthTag();
      encrypted = Buffer.concat([tag, encrypted]);
      fs.writeFileSync(filePathEnc, encrypted);
    } else {
      const inputFile = fs.readFileSync(filePathEnc);

      // base64 decoding
      const bData = Buffer.from(inputFile, 'base64');

      // convert data to buffers
      const tag = bData.subarray(0, 16);
      const ciphertext = bData.subarray(16);

      const decipher = crypto.createDecipheriv(ALGORITHM, passBuffer, ivBuffer, { encoding: 'base64' });
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      fs.writeFileSync(filePathDec, decrypted);
    }
    return true;
  } catch (e) {
    console.log('encryptDecryptFile - Error:', e);
    return false;
  }
}
