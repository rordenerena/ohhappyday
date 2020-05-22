import { ToastService } from './../toast.service';
import { ChildInfoFollower } from './../database/db.entities';
import { DbService } from './../database/db.service';
import { SignService } from './../sign.service';
import { ApiChildDelete } from './bean.comm';
import { ChildInfoTeacher } from '../database/db.entities';
import { PushService } from '../push.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChildManagerService {

  constructor(private pushService: PushService,
              private db: DbService,
              private toastService: ToastService) { }

  /**
   * The teacher send a push notification to follower
   * to notify the deleted child
   * @param child 
   */
  async deleteChild(child: ChildInfoTeacher) {
    let me = await this.db.getTeacher();
    let obj = ApiChildDelete.encode(child);
    obj = SignService.sign(obj, me.aes.secureKey);
    await this.pushService.notifyDeleteChild(child, obj);
  }

  async manageDeleteChild(data: ApiChildDelete): Promise<Boolean> {
    let childrens = await this.db.getChildrens();
    console.log(data, childrens)
    for (let i = 0; i < childrens.length; i++) {
      let cf = <ChildInfoFollower>childrens[i];
      if (cf.indexForTeacher == data.c) {
        if (SignService.verify(data, cf.teacher.aes.secureKey)) {
          cf.deleted = true;
          await this.db.setChild(cf);
          // await this.db.deleteChild(cf.index);
          return true;
        } else {
          this.toastService.toast("toast.msgnotverified", {name: cf.name});
          return false;
        }
      }
    }
  }
}