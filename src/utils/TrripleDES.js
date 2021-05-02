import CryptoJS from "crypto-js";

/**
 * Encrypt 3DES using Node.js's crypto module *
 * @param data A utf8 string
 * @param key Key would be hashed by md5 and shorten to maximum of 192 bits,
 * @returns {*} A base64 string
 */
const TripleDESdecrypt = (data, key) => {
  console.log("key", key);
  console.log("data", data);
  const info2 = CryptoJS.TripleDES.decrypt(data, key).toString();

  console.log("info2", { info2 });

  const info3 = JSON.parse(info2);

  console.log("info3", { str: info3.str });

  // var keyHex = CryptoJS.enc.Utf8.parse(key);
  // let decrypted = CryptoJS.TripleDES.decrypt(data, keyHex, {
  //   iv: CryptoJS.enc.Utf8.parse("01234567"),
  //   mode: CryptoJS.mode.CBC,
  //   padding: CryptoJS.pad.Pkcs7,
  // });

  // decrypted = decrypted.toString(CryptoJS.enc.Base64);
  // decrypted = decrypted.toString(CryptoJS.enc.Hex);
  return "11";
};

export default TripleDESdecrypt;
