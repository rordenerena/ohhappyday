import { TranslateService } from '@ngx-translate/core';
import { CentreInfo, Teacher, ChildInfoFollower } from './../../services/database/db.entities';
import { OneSignalService } from './../../services/onesignal.service';
import { ChildManagerService } from './../../services/comm/childmanager.service';
import { DbService } from '../../services/database/db.service';
import { MenuComponent } from './../../components/agenda/menu/menu.component';
import { ToastService } from './../../services/toast.service';
import { PairingService } from '../../services/comm/pairing.service';
import { Router } from '@angular/router';
import { Follower, ChildInfoTeacher, ProfileType } from '../../services/database/db.entities';
import { Component, OnInit, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, ControlValueAccessor } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-profile-child',
  templateUrl: './profile-child.page.html',
  styleUrls: ['./profile-child.page.scss'],
})
export class ProfileChildPage implements OnInit {

  entity: ChildInfoTeacher;
  public formData: FormGroup;
  title: string = '';
  formHasChanged: Boolean = false;
  isTeacher: boolean;
  centre: CentreInfo;
  teacher: Teacher;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private db: DbService,
    private route: ActivatedRoute,
    public alertController: AlertController,
    private childManagerService: ChildManagerService,
    public toastService: ToastService,
    private popoverController: PopoverController,
    private pairingService: PairingService,
    private onesignal: OneSignalService,
    private changeDetector: ChangeDetectorRef,
    private translate: TranslateService) {
    this.updateForm();
    this.db.getProfileType().then( type => {
      this.isTeacher = type === ProfileType.TEACHER;
    });
    this.onesignal.change.subscribe(async (event) => {
      debugger;
      if (event.page === 'profile-child') {
        if (this.entity && this.entity.index == event.data.child) {
          await this.loadEntity(event.data.child);
          this.changeDetector.detectChanges();
        }
      }
    })
  }

  getTitle() {
    console.log("Title:", this.title);
    if(this.title === "child.title" ) {
      return this.translate.instant(this.title);
    } else {
      return this.translate.instant('child.titlecustom', {name: this.title});
    }
  }

  /**
   * Make the form obj to binding and manage events
   * from the form UI
   */
  updateForm() {
    if (this.entity) {
      this.formData = this.formBuilder.group({
        picture: [this.entity.picture],
        name: [this.entity.name, Validators.required],
        birthdate: [this.entity.birthdate, Validators.required]
      });
      this.formData.valueChanges.subscribe(() => {
        this.formHasChanged = true;
      });
    }
  }

  ngOnInit() {
    this.loadChildFromUrl();
  }

  /**
   * Load the entity for a specific child index.
   * @param index 
   */
  async loadEntity(index: number) {
    let recovered = await this.db.getChild(index);
    recovered['followers'] = recovered['followers'] ? recovered['followers'] : [];
    this.entity = recovered ? <ChildInfoTeacher>recovered : this.entity;
    this.title = `${this.entity.name}`;
    console.log(this.entity);
    this.updateForm();
  }

  /**
   * Read the query parameters from the URL in order to
   * load the correct child
   */
  loadChildFromUrl() {
    this.route.queryParams.subscribe(async params => {
      if (params.child) {
        await this.loadEntity(params.child);
      } else {
        this.title = "child.title";
      }

      if(this.isTeacher !== undefined && !this.isTeacher) {
        this.centre = await this.db.getCentreInfo();
        this.teacher = ( <ChildInfoFollower><unknown>this.entity).teacher;
      }

      if(params.confirmSendPairing) {
        this.entity.followers.forEach(follower => {
          if(follower.index == params.confirmSendPairing) {
            this.requestSendInvitation(follower);
          }
        });
      }
      if (params.op && params.op === "new") {
        this.entity = new ChildInfoTeacher();
        this.updateForm();
      }
    });
  }

  /**
   * Save the entity and recover his stored information
   */
  private async save() {
    let v = Object.assign(this.entity, this.formData.value);
    this.entity = <ChildInfoTeacher>await this.db.setChild(v);
  }

  /**
   * Submit is like followin:
   * - Save the information into DB
   * - Navigate to the correct page: viewer for fathers and students for teacher.
   * 
   * This page is shared between profiels.
   */
  async submit() {
    this.save();
    this.router.navigate([await this.db.getInitialPage()]);
    // this.router.navigate(['/']);
  }

  /**
   * Submit is like:
   * - Save the enitty
   * - Router to the profile child saved
   * - Router to the profile-follower page to add some of this.
   */
  async addFollower() {
    await this.save();
    this.router.navigate(['/profile-child'], { queryParams: { child: this.entity.index } });
    setTimeout(() => {
      this.router.navigate(['/profile-follower'], { queryParams: { child: this.entity.index } });
    }, 0);
  }

  /**
   * Remove follower for a child.
   */
  async removeFollower(fdel: Follower) {

    const alert = await this.alertController.create({
      header: this.translate.instant('removefollower.header', {name: fdel.name, relationship: fdel.relationship}),
      message: this.translate.instant('removefollower.message'),
      buttons: [
        {
          text: this.translate.instant('dialogs.cancel'),
          role: 'cancel'
        }, {
          text: this.translate.instant('dialogs.delete'),
          cssClass: 'danger',
          handler: async () => {
            this.entity.followers = this.entity.followers.filter((value) => {
              if (JSON.stringify(value) !== JSON.stringify(fdel)) {
                return value;
              }
            });
            await this.save();
            // TODO: Notify to the follower
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Request confirmation to send a mail notification
   * to the follower in order to do the pairing.
   * @param follower 
   */
  async requestSendInvitation(follower: Follower) {
    const alert = await this.alertController.create({
      header: this.translate.instant('request-send-invitation.header'),
      subHeader: this.translate.instant('request-send-invitation.message', {name: follower.name}),
      buttons: [
        {
          text: this.translate.instant('request-send-invitation.qr'),
          handler: async () => {
            let teacher = await this.db.getTeacher();
            let centre = await this.db.getCentreInfo();
            let qrcode = this.pairingService.getQRCode(teacher, follower, centre, this.entity);
            this.showQRCode(qrcode);
          }
        },
        {
          text: this.translate.instant('request-send-invitation.mail'),
          handler: async () => {
            let teacher = await this.db.getTeacher();
            let centre = await this.db.getCentreInfo();
            this.pairingService.invite(teacher, follower, centre, this.entity);
          }
        },
        {
          text: this.translate.instant('dialogs.close'),
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  /**
   * Show the QR Code in order to pair familiar
   * @param follower 
   */
  async showQRCode(qrcode: string) {
    qrcode = qrcode.replace("base64:qrcode.png//","data:image/png;base64, ");
    const alert = await this.alertController.create({
      header: this.translate.instant('qrcode-pairing'),
      message: `<img src="${qrcode}" />`,
      buttons: [
        {
          text: this.translate.instant('dialogs.close'),
          role: 'cancel',
        }
      ]
    });

    await alert.present();
  }

  /**
   * Auxiliary methiod to the UI in order to configure and 
   * show the menu option for this page.
   */
  async showMenu(ev: any) {
    let options = {
      "delete-child": "menu.delete-student",
      "settings": "menu.settings"
      // "about": "Acerca de"
    };
    const popover = await this.popoverController.create({
      component: MenuComponent,
      componentProps: options,
      event: ev
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.op) {
      switch (data.op) {
        case "delete-child":
          this.deleteChild();
          break;
        default:
          this.router.navigate([`/${data.op}`]);
          break;
      }
    }
  }

  /**
   * Delete the child showed:
   * - Remove child from DB
   * - Navigate to correct page for the profile in session
   * - If is a teacher the profile in session, a push notification
   * will be sent to the followers of child.
   */
  async deleteChild() {
    const alert = await this.alertController.create({
      header: this.translate.instant('delete-child.header', {name: this.entity.name}),
      message: this.translate.instant('delete-child.message'),
      buttons: [
        {
          text: this.translate.instant('dialogs.cancel'),
          role: 'cancel'
        }, {
          text: this.translate.instant('dialogs.delete'),
          cssClass: 'danger',
          handler: async () => {
            let ptype = await this.db.getProfileType();
            // Esta primera opción sólo ha de ejecutarse cuando se es Teacher
            await this.db.deleteChild(this.entity.index);
            if (ptype == ProfileType.TEACHER) {
              await this.childManagerService.deleteChild(this.entity);
              this.router.navigate(['/students']);
            } else if (ptype == ProfileType.FOLLOWER) {
              this.router.navigate(['/viewer']);
            }
          }
        }
      ]
    });

    await alert.present();
  }

}
