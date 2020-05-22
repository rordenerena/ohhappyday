import { Agenda, Keys, Teacher, ProfileType, Follower, UserBase, CentreInfo, ChildInfo, ChildInfoFollower, Index } from './db.entities';
import { environment } from 'src/environments/environment.prod';
import { Injectable} from '@angular/core';
import { Storage } from '@ionic/storage';

declare var window;

@Injectable({
  providedIn: 'root'
})
export class DbService {

  disabled: Boolean = false;
  
  db = {
    set: async (key,vaue)=>{},
    get: async (key): Promise<any> => {}
  }

  constructor(private storage: Storage) {
    // this.storage.clear();
    this.db = {
      set: async (key,value) => {
        this.storage.set(key,value);
      },
      get: async (key) => {
        return await this.storage.get(key);
      }
    }

    window.ohd_list = async () => {
      let keys = await this.storage.keys();
      console.log("Keys DB: ", keys);

      keys.forEach( async element => {
        this.db.get(element).then( (data)=>{
          console.log(element, data);
        } )
      });
    }

    window.ohd_clear = async () => {
      this.storage.clear();
    }

    window.ohd_get = this.db.get;
    window.ohd_set = this.db.set;
  }

  async setProfileType(profileType: ProfileType) {
    await this.db.set(Keys.PROFILE, profileType);
  }

  async getProfileType(): Promise<ProfileType> {
    return await this.db.get(Keys.PROFILE);
  }

  async isTeacher() {
    return await this.getProfileType() === ProfileType.TEACHER;
  }

  async getInitialPage(): Promise<string> {
    if(await this.isConfigured()) {
      return (await this.getProfileType() == ProfileType.TEACHER) ? '/students' : '/viewer';
    } else {
      return "/init";
    }
  }

  async setTeacher(value: Teacher) {
    await this.db.set(Keys.USER_INFO, value);
  }
  
  async setFollower(value: Follower) {
    await this.db.set(Keys.USER_INFO, value);
  }
  
  async setUserBase(value: UserBase) {
    await this.db.set(Keys.USER_INFO, value);
  }

  async getUserBase(): Promise<UserBase> {
    let obj = await this.db.get(Keys.USER_INFO);
    return obj === undefined ? new UserBase() : obj;
  }
  
  async getTeacher(): Promise<Teacher> {
    let obj = await this.db.get(Keys.USER_INFO);
    // Inicialmente se guarda un UserBae con los ids push, así que mapeamos
    obj = Object.assign(new Teacher(), obj);
    return obj;
  }
  
  async getFollower(): Promise<Follower> {
    let obj = await this.db.get(Keys.USER_INFO);
    // Inicialmente se guarda un UserBae con los ids push, así que mapeamos
    obj = Object.assign(new Follower(), obj);
    return obj;
  }

  async setCentreInfo(value: CentreInfo) {
    console.log("Saving CentreInfo: ", value);
    await this.setObjectIndex(value, Keys.CENTRE);
    await this.db.set(Keys.CENTRE, value);
  }

  async setObjectIndex(index: Index, key: Keys) {
    if(index.index == null) {
      index.index = await this.getNext(key);
    }
  }

  async getCentreInfo(): Promise<CentreInfo> {
    let obj = await this.db.get(Keys.CENTRE);
    return obj === undefined ? new CentreInfo() : obj;
  }

  async isConfigured() {
    try{
      let r = await this.db.get(Keys.CONFIGURED);
      return r === true;
    }catch(err) {
      return false;
    }
  }

  async setConfigured(value = true) {
    this.db.set(Keys.CONFIGURED, value);
  }

  async getChildrens() {
    let maxIndex = await this.getIndex(Keys.CHILDREN);
    let childrens = [];
    for(let i=1;i<=maxIndex;i++) {
      let e = await this.db.get(`${Keys.CHILDREN}-${i}`);
      if(e!=null) {
        childrens.push(e);
      }
    }
    return childrens;
  }

  async setChild(child: ChildInfo): Promise<ChildInfo> {
    if(child.index === null) {
      // Establecemos el índice al objeto
      let index = await this.getNext(Keys.CHILDREN);
      child.index = index;
    }

    if(!environment.production) {
      // De esta forma el child nos vale tanto para teacher como para follower
      (<ChildInfoFollower>child).indexForTeacher = child.index;
    }
    
    console.log("Saving: ", child);
    await this.db.set(`${Keys.CHILDREN}-${child.index}`, child);
    return child;
  }

  async getChild(index: number): Promise<ChildInfo> {
    return <ChildInfo> await this.db.get(`${Keys.CHILDREN}-${index}`);
  }

  async deleteChild(index: number) {
    await this.storage.remove(`${Keys.CHILDREN}-${index}`);
  }

  /**
   * Devuelve el indice mayor encontrado para la clave
   * en cuestión, y sino existen, devuelve 0
   * @param key 
   */
  private async getIndex(key: Keys) {
    let indexes = await this.db.get(Keys.INDEX);
    
    if(indexes) {
      return indexes[key] ? indexes[key] : 0;
    } else {
      return 0;
    }
  }

  private async setIndex(key: Keys, index: number) {
    let indexes = await this.db.get(Keys.INDEX);
    if(indexes === null) {
      indexes = {};
    }
    indexes[key] = index;
    await this.db.set(Keys.INDEX, indexes);
  }

  /**
   * Devuelve el siguiente índice a usar para una clave
   * concreta.
   */
  async getNext(key: Keys) {
    let index = await this.getIndex(key);
    index++;
    await this.setIndex(key, index);
    return index;
  }

  async setAgenda(agenda: Agenda, teacher: Teacher) {
    await this.db.set(`${Keys.AGENDA}-${agenda.day}-${teacher.uuid}`, agenda);
  }

  async getAgenda(day: string, teacher: Teacher) {
    let adb = await this.db.get(`${Keys.AGENDA}-${day}-${teacher.uuid}`);
    return adb;
  }

  async getChildIds() {
    let data = await this.storage.keys();
    let ch = data.filter( (value) => {
      if(value.includes("children-")) {
        return value;
      }
    });
    for(let i=0;i<ch.length;i++) {
      ch[i] = ch[i].split("children-")[1];
    }
    console.log(data);
    console.log(ch);
    console.log(ch.sort());

    return ch.sort();
  }

}
