import { DbService } from '../../services/database/db.service';
import { AlertController } from '@ionic/angular';
import { PairingService } from './../../services/comm/pairing.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Follower, ChildInfoTeacher, Keys } from '../../services/database/db.entities';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-profile-follower',
  templateUrl: './profile-follower.page.html',
  styleUrls: ['./profile-follower.page.scss'],
})
export class ProfileFollowerPage implements OnInit {

  child: ChildInfoTeacher = new ChildInfoTeacher();
  entity: Follower = new Follower();

  public formData: FormGroup;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private db: DbService,
    private route: ActivatedRoute,
    private pairingService: PairingService,
    private alertController: AlertController) {
      this.updateForm();
    }

    /**
     * Make the obj form to binding and manage event from
     * the UI Form.
     */
    updateForm() {
      this.formData = this.formBuilder.group({
        name: [this.entity.name, Validators.required],
        relationship: [this.entity.relationship, Validators.required],
        tel: [this.entity.tel, Validators.required],
        mail: [this.entity.mail, Validators.required]
      });
    }

  ngOnInit() {
    this.route.queryParams
      .subscribe( async params => {
        if(params.child) {
          this.child = <ChildInfoTeacher> await this.db.getChild(params.child);
          if(params.index) {
            this.entity = await this.child.followers[params.index];
            this.updateForm();
          }
        } else {
          // Go to ... ¿students?
          this.router.navigate(['/students']);
        }
      });
  }

  /**
   * Save the entity into DB
   */
  async save() {
    this.entity = Object.assign(this.entity, this.formData.value);
    if(!this.child.followers) {
      this.child.followers = [];
    }
    this.entity.index = await this.db.getNext(Keys.FOLLOWER);
    this.child.followers.push(this.entity);
    
    await this.db.setChild(this.child);

    await this.requestSendInvitation(this.entity);

  }

  /**
   * Request a confirmation to send an invitation to the follower
   * signed up.
   * @param follower 
   */
  async requestSendInvitation(follower: Follower) {
    const alert = await this.alertController.create({
      header: "Invitación",
      subHeader: `¿Enviar invitación a ${follower.name}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.returnToProfileChild();
          }
        }, {
          text: 'Sí',
          handler: async () => {
            await this.sendInvitation(follower);
            this.returnToProfileChild();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Send mail invitation to the follower.
   * @param follower 
   */
  async sendInvitation(follower: Follower) {
    let teacher = await this.db.getTeacher();
    this.pairingService.invite(teacher, follower, this.child);
  }

  /**
   * Return to the profile child page.
   */
  async returnToProfileChild() {
    this.router.navigate(['/profile-child'], {queryParams: {child: this.child.index}});
  }

}
