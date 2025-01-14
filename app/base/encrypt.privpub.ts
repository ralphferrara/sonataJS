/*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
//|| Sonata :: Module
//|| Encrypt and Decrypt Billing Data
//||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Sonata :: Utils
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      import crypto                             from 'crypto';

      /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
      //|| Class
      //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

      export default class EncryptPrivPub {

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Generate Key Pair
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public static generateKeyPair(): { publicKey: string, privateKey: string } {
                  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                        modulusLength: 2048,
                        publicKeyEncoding: {
                              type: 'spki',
                              format: 'pem',
                        },
                        privateKeyEncoding: {
                              type: 'pkcs8',
                              format: 'pem',
                        },
                  });
                  return { publicKey, privateKey };
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Encrypt
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public static encrypt(data: string, publicKey: string): string {
                  const aesKey = crypto.randomBytes(32); // 256-bit key for AES-256
                  const iv = crypto.randomBytes(16); // Initialization vector

                  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
                  let encryptedData = cipher.update(data, 'utf8', 'base64');
                  encryptedData += cipher.final('base64');

                  const encryptedDataWithIv = iv.toString('base64') + encryptedData;

                  const encryptedKey = crypto.publicEncrypt(
                        {
                              key: publicKey,
                              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                              oaepHash: 'sha256',
                        },
                        aesKey
                  ).toString('base64');

                  return JSON.stringify({ encryptedData: encryptedDataWithIv, encryptedKey });
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| Decrypt
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/

            public static decrypt(encryptedDataWithIvAndKey: string, privateKey: string): string | undefined {
                  try {
                        const { encryptedData, encryptedKey } = JSON.parse(encryptedDataWithIvAndKey);

                        const iv = Buffer.from(encryptedData.slice(0, 24), 'base64');
                        const encryptedDataWithoutIv = encryptedData.slice(24);

                        const aesKey = crypto.privateDecrypt(
                              {
                                    key: privateKey,
                                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                                    oaepHash: 'sha256',
                              },
                              Buffer.from(encryptedKey, 'base64')
                        );

                        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
                        let decryptedData = decipher.update(encryptedDataWithoutIv, 'base64', 'utf8');
                        decryptedData += decipher.final('utf8');

                        return decryptedData;
                  } catch (error) {
                        return undefined; // Or throw a custom error
                  }
            }

            /*||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||
            //|| EOC
            //||=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-==-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-||*/
      }
