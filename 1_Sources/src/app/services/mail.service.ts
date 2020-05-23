import { TranslateService } from '@ngx-translate/core';
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
    private platform: PlatformService,
    private translate: TranslateService) {
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
      subject: this.translate.instant('mail.invite.subject', { centre: centre.name }),
      body: this.translate.instant(
        'mail.invite.body',
        {
          follower: follower.name,
          teacher: user.name,
          child: child.name,
          centremail: centre.mail,
          centre: centre.name
        }
      )
    }
    console.log(email);
    this.open(email);

  }

  /**
   * Request for/Open the mail client in this device.
   */
  private open(email) {
    if (this.platform.isIos()) {
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
