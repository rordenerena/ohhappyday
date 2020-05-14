import { AesService } from './../aes.service';
import { ApiAgendaObject } from './bean.comm';
import { ToastService } from './../toast.service';
import { SignService } from './../sign.service';
import { DbService } from '../database/db.service';
import { PushService } from '../push.service';
import { Router } from '@angular/router';
import { Agenda, AgendaItem, ChildInfoFollower, ChildInfoTeacher } from '../database/db.entities';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {

  constructor(private db: DbService,
    private router: Router,
    private pushService: PushService,
    private toastService: ToastService,
    private aesService: AesService) { }

  /**
   * The teacher send the student agenda
   * @param agenda 
   * @param agendaItem 
   * @param child 
   */
  async sendAgenda(agenda: Agenda, agendaItem: AgendaItem, child: ChildInfoTeacher) {
    let me = await this.db.getTeacher();
    let obj = ApiAgendaObject.encode(agenda, agendaItem, child);
    obj = SignService.sign(obj, me.aes.secureKey);
    obj.data = await this.aesService.encrypt(me.aes, JSON.stringify(obj.data));
    let ids: String[] = [];
    child.followers.forEach(element => {
      ids.push(element.push.id);
    });
    this.pushService.sendAgenda(ids, obj, child);
  }

  /**
   * The follower receive the agenda and should be add it
   */
  async registerAgenda(json: ApiAgendaObject) {
    // Buscar el child-index del follower parea el child-index del teacher
    let ids = await this.db.getChildIds();
    let child: ChildInfoFollower;

    for (let i = 0; i < ids.length; i++) {
      let c: ChildInfoFollower = <ChildInfoFollower>await this.db.getChild(parseInt(ids[i], 10));
      if (c.indexForTeacher == json.c) {
        child = c;

        json.data = await this.aesService.decrypt(child.teacher.aes, json.data);
        json.data = JSON.parse(json.data);

        if (SignService.verify(json, child.teacher.aes.secureKey)) {
          let [agenda, agendaItem] = ApiAgendaObject.decode(json);
  
          let agendaDb = await this.db.getAgenda(new Agenda().day, c.teacher);
          if (agendaDb != null) {
            agenda = Object.assign(agendaDb, agenda);
          }
  
          agenda.children[child.index] = agendaItem;
  
          await this.db.setAgenda(agenda, child.teacher);
          this.router.navigate(['/viewer'], { queryParams: { child: child.index, day: agenda.day } });
        } else {
          this.toastService.toast(`Mensaje no verificado para el estudiante: '${child.name}'`)
        }

      }
    }
  }
}