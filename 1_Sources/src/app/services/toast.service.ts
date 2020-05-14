import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  /**
   * 
   * @param msg Show a toast message
   */
  async toast(msg: string) {
    const t = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    t.present();
  }
}
