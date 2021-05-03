import cryptojs from "crypto-js";

const TripleDESdecrypt = (data, key) => {
  const keyhex = cryptojs.enc.Utf8.parse(key)
  //direct decrypt ciphertext
  const decrypted = cryptojs.TripleDES.decrypt({
    ciphertext: cryptojs.enc.Base64.parse(data)
  }, keyhex, {
    mode: cryptojs.mode.ECB, padding: cryptojs.pad.Pkcs7
  });
  return decrypted.toString(cryptojs.enc.Utf8);

};

export default TripleDESdecrypt;
