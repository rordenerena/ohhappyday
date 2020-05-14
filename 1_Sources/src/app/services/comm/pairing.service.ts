import { AesService } from './../aes.service';
import { ApiResponseObject, ApiInviteObject } from './bean.comm';
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

  /**
   * Paso 1: Enviar e-mail para crear el hijo en Follower
   */
  invite(teacher: Teacher, follower: Follower, child: ChildInfoTeacher) {
    let obj = ApiInviteObject.encode(teacher, child, follower, this.platform.getPlatform());
    let qrcode = this.qrCode.genQRCode(obj);
    this.mailService.sendPairing(teacher, follower, child, qrcode);
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
      throw "El código QR no es válido";
    } else {
      // Es válido
      let child: ChildInfoFollower;
      let me: Follower = await this.db.getFollower();
      [child, me] = ApiInviteObject.decode(me, json);

      await this.db.setChild(child);
      await this.db.setFollower(me);
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

      let child: ChildInfoTeacher = <ChildInfoTeacher>await this.db.getChild(data.c);

      child.followers.forEach(f => {
        if (f.index === followerId) {
          f.push = ids;
        }
      });

      await this.db.setChild(child);
    } else {
      this.toastService.toast(`Mensaje no verificado para el estudiante: '${(await this.db.getChild(data.c)).name}'`)
    }
  }
}