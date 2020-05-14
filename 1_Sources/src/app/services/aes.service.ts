import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { AesKeys } from './database/db.entities';

declare var cordova: any;

@Injectable({
  providedIn: 'root'
})
export class AesService {

  constructor(private platform: Platform) {
  }

  encrypt(aes: AesKeys, data: string) {
    return new Promise( (resolve, reject) => {
      this.platform.ready().then(() => {
        cordova.plugins.AES256.encrypt(aes.secureKey, aes.secureIV, data,
          (encrypedData) => {
            console.log('Encrypted Data----', encrypedData);
            resolve(encrypedData);
          }, (error) => {
            console.log('Error----', error);
            reject(error);
          });
      });
    } );
  }

  decrypt(aes: AesKeys, encryptedData: string) {
    return new Promise( (resolve, reject) => {
      this.platform.ready().then(() => {
        cordova.plugins.AES256.decrypt(aes.secureKey, aes.secureIV, encryptedData,
          (decryptedData) => {
            console.log('Decrypted Data----', decryptedData);
            resolve(decryptedData);
          }, (error) => {
            console.log('Error----', error);
            reject(error);
          });
      });
    });
  }
  
  private async generateSecureKey(password) {
    return new Promise((resolve, reject)=>{
      this.platform.ready().then(() => {
        cordova.plugins.AES256.generateSecureKey(password,
          (secureKey) => {
            console.log('Secure Key----', secureKey);          
            resolve(secureKey);
          }, (error) => {
            reject(error);
          });
      });
    });
  }
  
  private async generateSecureIV(password) {
    return new Promise((resolve, reject)=>{
      this.platform.ready().then(() => {
        cordova.plugins.AES256.generateSecureIV(password,
          (secureIV) => {
            console.log('Secure IV----', secureIV);          
            resolve(secureIV);
          }, (error) => {
            reject(error);
          });
      });
    });
  }
}
