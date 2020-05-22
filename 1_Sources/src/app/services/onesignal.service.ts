import { environment } from './../../environments/environment';
import { ToastService } from './toast.service';
import { ChildManagerService } from './comm/childmanager.service';
import { ApiResponseObject, ApiAgendaObject } from './comm/bean.comm';
import { PlatformService } from './platform.service';
import { DbService } from './database/db.service';
import { AgendaService } from './comm/agenda.service';
import { PairingService } from './comm/pairing.service';
import { ApiOp } from '../app.const';
import { OneSignalIds, UserBase, ChildInfoFollower, ChildInfoTeacher } from './database/db.entities';
import { Injectable } from '@angular/core';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Subject } from 'rxjs';

import * as privacy from '../../privacy.json'

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {

  appId: string = privacy.appId;
  googleProjectNumber: string = privacy.googleProjectNumber;
  apiUrl: string = privacy.apiUrl;
  apiKey: string = privacy.apiKey;
  public change = new Subject<any>();

  constructor(private oneSignal: OneSignal,
    private db: DbService,
    private pairingService: PairingService,
    private agendaService: AgendaService,
    private platformService: PlatformService,
    private childManager: ChildManagerService,
    private toastService: ToastService) { }

  /**
   * Check if the token push and identity from OneSignal has changed.
   * Save it in any case.
   */
  async checkToken(retry = false) {
    let ids: {
      userId: string;
      pushToken: string;
    };
    try{
      ids = await this.oneSignal.getIds();
    } catch(err) {
      if(err) {
        //
      }
      ids = {
        userId: "",
        pushToken: ""
      };
    }
    let userInfo: UserBase = await this.db.getUserBase();
    let save = false;

    console.log("Push: ", ids);

    if (userInfo != null) {
      if (userInfo.push != null) {
        if (JSON.stringify(ids) !== JSON.stringify(userInfo.push)) {
          // TODO: For the future, when exists chat and other features -> Notify all followers about my new push token 
          save = true;
        } else {
          // No change, no pain
        }
      } else {
        // Guardamos en userInfo el token
        save = true;
      }
    } else {
      userInfo = new UserBase();
      save = true;
    }

    if (save) {
      userInfo.push = new OneSignalIds();
      userInfo.push.id = ids.userId;
      userInfo.push.push = ids.pushToken;
      if(!userInfo.platform) {
        userInfo.platform = this.platformService.getPlatform();
      }
      if(retry) {
        if(!environment.production) {
          this.toastService.toast(`toast.commfetchcustom`, { name: userInfo.push.id});
        } else {
          this.toastService.toast(`toast.commfetch`);
        }
      }
      await this.db.setUserBase(userInfo);

      if(!retry) {
        // Si tenemos nuevos IDs y no es un refresco a petición, enviamos a todos los followers
        this.pairingService.reInvite();
      }
    }
  }

  /**
   * Configure and started the callbacks for Pûsh Notification Service.
   */
  initConfig() {
    this.oneSignal.startInit(this.appId, this.googleProjectNumber);

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((event) => {
      /**
       * {isAppInFocus: false, shown: true, androidNotificationId: 1983191318, displayType: 0, payload: {…}}
          androidNotificationId: 1983191318
          displayType: 0
          isAppInFocus: false
          payload:
            actionButtons: Array(2)
              0: {id: "1", text: "button1", icon: ""}
              1: {id: "2", text: "button2", icon: ""}
              length: 2
              __proto__: Array(0)
            additionalData:
              123: "dsadf"
              id: "123"
              __proto__: Object
            body: "qwe"
            fromProjectNumber: "465195562219"
            groupMessage: ""
            lockScreenVisibility: 1
            notificationID: "b98c843c-a395-4446-bdea-580bb0733667"
            priority: 5
            rawPayload: "{"google.delivered_priority":"normal","google.sent_time":1586760060624,"google.ttl":259200,"google.original_priority":"normal","custom":"{\"a\":{\"123\":\"dsadf\",\"id\":\"123\",\"actionButtons\":[{\"id\":\"1\",\"text\":\"button1\",\"icon\":\"\"},{\"id\":\"2\",\"text\":\"button2\",\"icon\":\"\"}],\"actionSelected\":\"__DEFAULT__\"},\"i\":\"b98c843c-a395-4446-bdea-580bb0733667\"}","oth_chnl":"","pri":"5","vis":"1","from":"465195562219","alert":"qwe","title":"123","grp_msg":"","google.message_id":"0:1586760060636007%f6d21efbf9fd7ecd","google.c.sender.id":"465195562219","notificationId":1983191318}"
            title: "123"
            __proto__: Object
            shown: true
          __proto__: Object
       */
      console.log(`handleNotificationReceived: `, event);
      this.managePush(event.payload.additionalData);
    });

    this.oneSignal.handleNotificationOpened().subscribe((event: any) => {
      /**
        handleNotificationOpened:  
        {
        action:
          actionID: "1"
          type: 1
          __proto__: Object
        notification: // ESTE ES EL MISMO OBJETO QUE ARRIBA
          androidNotificationId: 1983191318
          displayType: 0
          isAppInFocus: false
          payload: {notificationID: "b98c843c-a395-4446-bdea-580bb0733667", title: "123", body: "qwe", additionalData: {…}, lockScreenVisibility: 1, …}
          shown: true
          __proto__: Object
          __proto__: Object
       */
      console.log(`handleNotificationOpened: `, event);
      this.managePush(event.notification.payload.additionalData);
    });

    this.oneSignal.endInit();
    this.checkToken();
  }

  /**
   * Callback for the notification received
   */
  async managePush(data: any) {
    debugger;
    switch(data.op) {
      case ApiOp.PAIRING_RESPONSE:
        await this.pairingService.registerFollower((<ApiResponseObject> data));
        this.change.next({page: 'profile-child', data: { child: (<ApiResponseObject>data).c }});
        break;
      case ApiOp.AGENDA_SEND:
        await this.agendaService.registerAgenda(data);
        this.change.next({page: 'agenda', data: { day: (<ApiAgendaObject>data).data.d, child: (<ApiAgendaObject>data).c }});
        break;
      case ApiOp.DELETE_CHILD:
        let b = await this.childManager.manageDeleteChild(data);
        if(b) {
          this.change.next({page: 'viewer'})
        }
        break;
      case ApiOp.PAIRING_REINVITE: 
        await this.pairingService.reInviteReceived(data);
        break;
    }
  }
}
