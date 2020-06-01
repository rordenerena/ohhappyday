import { UserBase, CentreInfo } from './../database/db.entities';
import { AesService } from './../aes.service';
import { ApiResponseObject, ApiInviteObject, ApiReInviteObject } from './bean.comm';
import { ToastService } from './../toast.service';
import { SignService } from './../sign.service';
import { PlatformService } from './../platform.service';
import { OneSignalIds, Teacher, ChildInfoFollower, ChildInfoTeacher, Follower } from '../database/db.entities';
import { MailService } from '../mail.service';
import { QrcodeService } from '../qrcode.service';
import { PushService } from '../push.service';
import { DbService } from '../database/db.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PairingService {

  constructor(private db: DbService,
    private pushService: PushService,
    private qrCode: QrcodeService,
    private mailService: MailService,
    private platform: PlatformService,
    private toastService: ToastService,
    private aesService: AesService) {
    // Nothing TO-DO
  }

  getQRCode(teacher: Teacher, follower: Follower, centre: CentreInfo, child: ChildInfoTeacher) {
    if (teacher.push) {
      let obj = ApiInviteObject.encode(teacher, child, follower, centre, this.platform.getPlatform());
      let qrcode = this.qrCode.genQRCode(obj);
      return qrcode;
    } else {
      this.toastService.toast("toast.fetchcommidagain",{}, 3500);
    }
  }

  /**
   * Paso 1: Enviar e-mail para crear el hijo en Follower
   */
  invite(teacher: Teacher, follower: Follower, centre: CentreInfo, child: ChildInfoTeacher) {
    if (teacher.push) {
      let obj = ApiInviteObject.encode(teacher, child, follower, centre, this.platform.getPlatform());
      let qrcode = this.qrCode.genQRCode(obj);
      this.mailService.sendPairing(teacher, follower, child, qrcode);
    } else {
      this.toastService.toast("toast.fetchcommidagain",{}, 3500);
    }
  }


  /**
   * Paso 2: Registrar al hijo recibido por correo a través del QRCode
   * 
   * Éste método leerá el objeto recibido por push de emparejamiento,
   * y lo almacenará en BBDD
   */
  async registerChild(json: ApiInviteObject): Promise<ChildInfoFollower> {
    console.log("Scanned: ", json);

    if (!ApiInviteObject.check(json)) {
      console.error("No se ha validado el JSON con el esquema:", json);
      throw "toast.qrinvalid";
    } else {
      // Es válido
      let child: ChildInfoFollower;
      let me: Follower = await this.db.getFollower();
      let centre: CentreInfo;
      [child, me, centre] = ApiInviteObject.decode(me, json);

      await this.db.setChild(child);
      await this.db.setFollower(me);
      await this.db.setCentreInfo(centre);
      await this.db.setConfigured();

      return child;
    }
  }

  /**
   * Paso 3: Enviar información push al Teacher para que me pueda enviar
   * la agenda diaria de mi hijo.
   * 
   * Éste método será usado por Follower para enviar a Teacher
   * la información de emparejamiento necesaria para recibir
   * la agenda de su hijo.
   */
  async response(userInfo: Follower, child: ChildInfoFollower) {
    // Envíamos nuestro token push al profesor
    let obj: ApiResponseObject = ApiResponseObject.encode(userInfo, child, this.platform.getPlatform());
    obj = SignService.sign(obj, child.teacher.aes.secureKey);
    obj.data = await this.aesService.encrypt(child.teacher.aes, JSON.stringify(obj.data));
    this.pushService.sendPairingResponse(child, obj);
  }

  async updateResponse(userInfo: Follower, child: ChildInfoFollower) {
    // Re-nvíamos nuestro token push al profesor
    let obj = ApiResponseObject.encode(userInfo, child, this.platform.getPlatform());
    obj = SignService.sign(obj, child.teacher.aes.secureKey);
    obj.data = await this.aesService.encrypt(child.teacher.aes, JSON.stringify(obj.data));
    this.pushService.sendUpdatePairingResponse(child, obj);
  }

  /**
   * Paso 4: Teacher almacenará la información Push de Follower
   * para poder enviarle agenda diaria.
   * 
   * Éste método será usado por Teacher al recibir un push
   * con la ifnormación de emparejamiento del Follower invitado.
   * 
   * Creará el objeto de respuesta y lo enviará
   */
  async registerFollower(data: ApiResponseObject) {

    let childrenIndex = 0;
    let followerId = 0;
    let ids: OneSignalIds;

    let me = await this.db.getUserBase();
    data.data = await this.aesService.decrypt(me.aes, data.data);
    data.data = JSON.parse(data.data);

    if (SignService.verify(data, me.aes.secureKey)) {

      [childrenIndex, followerId, ids] = ApiResponseObject.decode(data);

      let child: ChildInfoTeacher = <ChildInfoTeacher>await this.db.getChild(childrenIndex);

      child.followers.forEach(f => {
        if (f.index === followerId) {
          f.push = ids;
        }
      });

      await this.db.setChild(child);
    } else {
      let child = await this.db.getChild(data.c);
      this.toastService.toast("toast.msgnotverified", {name: child.name});
    }
  }

  /**
   * Send the puhs information to specific devices (followers)
   * @param ids 
   */
  async reInvite() {
    let me = await this.db.getUserBase();
    // Tengo que enviar a cada child, el mensaje con el push actualizado
    let ids: Array<any> = await this.db.getChildIds();
    for (let i = 0; i < ids.length; i++) {
      let ch: ChildInfoTeacher = <ChildInfoTeacher> await this.db.getChild(ids[i]);

      let obj = ApiReInviteObject.encode(me, ch);
      obj = SignService.sign(obj, me.aes.secureKey);
      obj.data = await this.aesService.encrypt(me.aes, JSON.stringify(obj.data));
      this.pushService.sendTeacherCommIds(ch, obj);
    }

  }

  async reInviteReceived(data: ApiReInviteObject) {
    let teacher: Teacher, childIndex: number;

    let child: ChildInfoFollower = <ChildInfoFollower> await this.db.getChild(data.c);
    data.data = await this.aesService.decrypt(child.teacher.aes, data.data);
    data.data = JSON.parse(data.data);

    if (SignService.verify(data, child.teacher.aes.secureKey)) {
      [teacher, childIndex] = ApiReInviteObject.decode(data);

      child.teacher.push = teacher.push;
      child.teacher.name = teacher.name;
      child.teacher.mail = teacher.mail;

      await this.db.setChild(child);

      this.toastService.toast("toast.successupdate")
    } else {
      this.toastService.toast("toast.msgnotverified", {name: child.name});
    }
  }
}