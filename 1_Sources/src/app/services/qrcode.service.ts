import { Injectable } from '@angular/core';

declare var QRious: any;

@Injectable({
  providedIn: 'root'
})
export class QrcodeService {

  version: number = 1;
  constructor() { }

  /**
   * Generate a textual QR Code with the JSON stringified
   * passed as args
   * @param obj 
   */
  genQRCode(obj: Object) {
    
    let qr = new QRious({
      value: JSON.stringify(obj),
      size: 300
    })
    let base64 = qr.toDataURL();

    return base64.replace("data:image/png;base64,","base64:qrcode.png//");
  }
}
