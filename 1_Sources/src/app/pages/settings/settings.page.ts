import { PairingService } from './../../services/comm/pairing.service';
import { ToastService } from './../../services/toast.service';
import { OneSignalService } from './../../services/onesignal.service';
import { DbService } from './../../services/database/db.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  isTeacher: Boolean = true;

  constructor(private db: DbService,
    private oneSignalService: OneSignalService,
    private toastService: ToastService,
    private pairingService: PairingService) {

  }

  async ngOnInit() {
    this.isTeacher = await this.db.isTeacher();
  }

  async resend() {
    if (this.isTeacher) {
      await this.oneSignalService.checkToken(true);
      await this.pairingService.reInvite();
      this.toastService.toast(`toast.tupdatecomm`);
    } else {
      (await this.db.getChildrens()).forEach(async element => {
        this.pairingService.updateResponse(await this.db.getFollower(), element);
      });
      this.toastService.toast("toast.fupdatecomm")
    }

  }

  async updateIds() {
    this.oneSignalService.checkToken(true);
  }

}
