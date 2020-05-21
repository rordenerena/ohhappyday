import { ChildInfoFollower, ChildInfoTeacher } from './database/db.entities';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiChildDelete } from './comm/bean.comm';

import * as privacy from '../../privacy.json'

@Injectable({
  providedIn: 'root'
})
export class PushService {

  appId: string = privacy.appId;
  apiUrl: string = privacy.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Send the delete child notification to users.
   * @param child 
   * @param payload 
   */
  notifyDeleteChild(child: ChildInfoTeacher, payload: ApiChildDelete) {
    let msg = {
      "es": `${child.name} ha sido dado de baja`,
      "en": `${child.name} has been remove from system`
    }
    child.followers.forEach(element => {
      if(element.push && element.push.id) {
        this.sendPush([element.push.id], payload, msg);
      }
    });
  }

  /**
   * Send the pairing response to the teacher
   */
  sendPairingResponse(child: ChildInfoFollower, payload: Object) {
    // TODO: Enviar al profesor mi token para que me envíe actualizaciones :-D
    let msg = {
      "es": `Solicitud de seguimiento para ${child.name}`,
      "en": `Follow request for ${child.name}`
    };
    this.sendPush([child.teacher.push.id], payload, msg);
  }
  
  /**
   * Resend the communication IDs of the follower to the teacher
   */
  sendUpdatePairingResponse(child: ChildInfoFollower, payload: Object) {
    // TODO: Enviar al profesor mi token para que me envíe actualizaciones :-D
    let msg = {
      "es": `Recepción de nuevos IDs de comunicación para ${child.name}`,
      "en": `New comm ids received to ${child.name}`
    };
    this.sendPush([child.teacher.push.id], payload, msg);
  }

  /**
   * 
   * @param ids 
   * @param obj 
   */
  sendTeacherCommIds(ch: ChildInfoTeacher, payload: Object) {
    let msg = {
      "es": `Actualización IDs de comunicación para ${ch.name}. Pulsame para seguir recibiendo su agenda`,
      "en": `Comm IDs updated for ${ch.name}. Touch me to receive his agenda`
    };
    let ids = [];
    ch.followers.forEach(element => {
      ids.push(element.push.id);
    });
    this.sendPush(ids, payload, msg);
  }


  /**
   * Send agenda to the followers
   * @param to 
   * @param payload 
   * @param child 
   */
  sendAgenda(to: Array<String>, payload: Object, child: ChildInfoTeacher) {
    let msg = {
      "es": `Agenda de ${child.name} disponible`,
      "en": `${child.name} daily report available`
    }
    this.sendPush(to, payload, msg);
  }

  /**
   * to String[]: Array con los "userId" de Opensignal del usuario en cuestión
   * data example, this is payload: { "any_key": "any_value" }
   * contents example: { "es": "Hola!", "en": "Hello!"}
   */
  private sendPush(to: String[], payload: Object, msg: Object, callback = null) {
    let params = JSON.stringify({
      "app_id": this.appId,
      "include_player_ids": to,
      "data": payload,
      "contents": msg,
      "headings": {
        "en": "Oh! Happy Day"
      }
    });
    let headers = {
      headers: {
        'Content-Type': "application/json; charset=utf-8"
      }
    }

    console.log("PUSH SEND: ", params);

    this.http.post(this.apiUrl, params, headers).subscribe((data) => {
      console.log(data);
      if (callback) {
        callback(data);
      }
    });
  }
}
