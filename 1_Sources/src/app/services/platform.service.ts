import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(private platform: Platform) { }

  /**
   * Return a flag that indicate if the target in execution is a browser
   */
  isBrowser() {
      console.log(this.platform.platforms());
      return this.platform.is('mobileweb');
  }

  isIos() {
    return this.getPlatform() === "ios";
  }

  isAndroid() {
    return this.getPlatform() === "android";
  }

  /**
   * Return the platforms that this application knows and manage
   */
  getPlatform() {
    if(this.platform.platforms().includes("android")) {
      return "android"
    } else if(this.platform.platforms().includes("ios")) {
      return "ios"
    } else {
      return "web";
    }
  }
}
