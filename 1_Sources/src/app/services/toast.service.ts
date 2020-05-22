import { TranslateService } from '@ngx-translate/core';
import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController,
    private translate: TranslateService) { }

  /**
   * 
   * @param msg Show a toast message
   */
  async toast(msg: string, opts = {}, duration = 2000) {
    msg = this.translate.instant(msg, opts);
    const t = await this.toastController.create({
      message: msg,
      duration: duration
    });
    t.present();
  }
  
  /**
   * 
   * @param msg Show a toast message
   */
  async toastRaw(msg: string, duration = 2000) {
    const t = await this.toastController.create({
      message: msg,
      duration: duration
    });
    t.present();
  }
}
