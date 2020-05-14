import { DbService } from './database/db.service';
import { Teacher, Follower, ChildInfo } from './database/db.entities';
import { Injectable } from '@angular/core';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { PlatformService } from './platform.service';


@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private emailComposer: EmailComposer,
    private db: DbService,
    private platform: PlatformService) {
  }

  /**
   * Design and fill a mail template to send Pairing mail to the followers
   * @param user 
   * @param follower 
   * @param child 
   * @param qrCode 
   */
  async sendPairing(user: Teacher, follower: Follower, child: ChildInfo, qrCode: String) {
    console.log("sendPairing: ", user, follower, child, qrCode);
    let centre = await this.db.getCentreInfo();

    let email = {
      isHtml: true,
      to: follower.mail,
      bcc: [centre.mail],
      attachments: [`${qrCode}`],
      subject: `[${centre.name}] Bienvenido@ a la agenda digital de su hij@`,
      body: `<h1>Hola, ${follower.name}</h1>
      <p>Soy ${user.name}, educador de su hij@ ${child.name}. Si deseas recibir notificaciones de la agenda diaria, descargue la aplicación "Oh! Happy Day" de la tienda de aplicaciones de su móvil y escanee el código QR adjunto.</p>
      <p>Si tienes alguna pregunta, escribe al centro en la dirección de correo electrónico <a href="mailto:${centre.mail}">${centre.mail}</a> e intentaremos resolver todas tus dudas.</p>
      <p>Bienvenid@ a bordo,</p>
      <p>${centre.name}</p>`
    }
    this.open(email);

  }

  /**
   * Request for/Open the mail client in this device.
   */
  private open(email) {
    if(this.platform.isIos()) {
      this.emailComposer.open(email);
    } else {
      this.emailComposer.isAvailable().then(async (available: boolean) => {
        if (available) {
          console.log(email);
          // Send a text message using default options
          this.emailComposer.open(email);
        }
      });
    }
  }
}
