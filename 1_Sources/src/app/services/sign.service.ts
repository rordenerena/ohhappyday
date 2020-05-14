import { ApiResponseObject, ApiAgendaObject, ApiChildDelete } from './comm/bean.comm';
import { ApiOp } from './../app.const';
import {Md5} from 'ts-md5/dist/md5';

export class SignService {

  static key = "sign";
  /**
   * Recibimos un objeto JSON
   *  - Stringity del mismo
   *  - Añadimos el key
   *  - Generamos MD5
   * @param obj 
   * @param key 
   */
  static sign(obj: any, key: string) {
    let str;

    switch(obj.op) {
      case ApiOp.PAIRING_RESPONSE:
        str = ApiResponseObject.toString(obj);
        break;
      case ApiOp.AGENDA_SEND:
        str = ApiAgendaObject.toString(obj);
        break;
      case ApiOp.DELETE_CHILD:
        str = ApiChildDelete.toString(obj);
        break;
      default:
        str = JSON.stringify(obj);
        break;
    }
    str += key;
    obj[this.key] = Md5.hashStr(str);
    return obj;
  }

  static verify(obj: Object, key: string) {
    let sign = obj[this.key];
    delete obj[this.key];
    let objcheck = this.sign(obj, key);
    return objcheck[this.key] === sign;
  }
}