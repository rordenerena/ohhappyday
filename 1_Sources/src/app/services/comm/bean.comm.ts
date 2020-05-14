import { Teacher, ChildInfo, Follower, OneSignalIds } from './../database/db.entities';
import { SignMessage } from './../../app.const';
import { ApiOp, VERSION } from '../../app.const';
import { Agenda, AgendaItem, ChildInfoFollower, EventDay, ChildInfoTeacher, RatingVal, getMoodStatus, getpooType } from '../database/db.entities';

import Ajv from 'ajv'

import PairingSchema from './../schemas/pairing.json';

export class ApiInviteObject extends SignMessage {

    /**
     * Version of API for this message
     */
    v = VERSION;
    /**
     * Operation
     */
    op = ApiOp.PAIRING_INVITE;
    /**
     * Teacher information
     */
    t = {
        /**
         * Mail of teacher
         */
        m: "",
        /**
         * Push token
         */
        p: "",
        /**
         * ID from OneSignal
         */
        i: "",
        /**
         * Mobile platform
         */
        pf: "",
        /**
         * Name
         */
        n: "",
        /**
         * AES Key
         */
        ak: "",
        /**
         * AES IV
         */
        ai: ""
    };
    /**
     * Children information
     */
    c = {
        /**
         * Index of teacher app, for easy recognition in
         * message exchanged between both
         */
        i: 0,
        /**
         * Name of children
         */ 
        n: ""
    };
    f: number;

    static encode(teacher: Teacher, child: ChildInfo, follower: Follower, platform: string) {
        let io = new ApiInviteObject();
        io.t = {
            m: encodeURI(teacher.mail),
            p: encodeURI(teacher.push ? teacher.push.push : null),
            i: encodeURI(teacher.push ? teacher.push.id : null),
            pf: encodeURI(platform),
            n: encodeURI(teacher.name),
            ai: encodeURI(teacher.aes.secureIV),
            ak: encodeURI(teacher.aes.secureKey)
        };
        io.c = {
            i: child.index,
            n: encodeURI(child.name),
        };
        io.f = follower.index;
        return io;
    }


    static decode(me: Follower, json: ApiInviteObject): [ChildInfoFollower, Follower] {
        let teacher = new Teacher();
        teacher.name = decodeURI(json.t.n);
        teacher.mail = decodeURI(json.t.m);
        teacher.push = new OneSignalIds();
        teacher.push.push = decodeURI(json.t.p);
        teacher.push.id = decodeURI(json.t.i);
        teacher.platform = decodeURI(json.t.pf);
        teacher.aes.secureIV = decodeURI(json.t.ai);
        teacher.aes.secureKey = decodeURI(json.t.ak);

        let child = new ChildInfoFollower();
        child.teacher = teacher;
        child.name = decodeURI(json.c.n);
        child.indexForTeacher = json.c.i;

        me.idOnTeacherApp = json.f;

        return [child, me];
    }

    static check(pairedObj: ApiInviteObject) {
        console.log(PairingSchema);
        let ajv = new Ajv();
        let validate = ajv.compile(PairingSchema);
        let valid = validate(pairedObj);
        if (!valid) console.log(validate.errors);
        return valid;
    }
}

export class ApiResponseObject extends SignMessage {

    v = VERSION;
    /**
     * Operation
     */
    op = ApiOp.PAIRING_RESPONSE;
    /**
     * Children Index
     */
    c: number;

    data: any = {
        /**
         * Follower Information
         */
        f: {
            /**
             * Follower ID
             */
            id: 0,
            /**
             * Push
             */
            p: null,
            /**
             * Identity on OneSignal
             */
            i: null,
            /**
             * Platforma
             */
            pf: ""
        }
    }

    constructor(obj = undefined) {
        super();
        if (obj) {
            this.c = obj.c;
            this.data.f = obj.data.f;
        }
    }

    /**
     * Return the index of children
     */
    getChildrenIndex() {
        return this.c;
    }

    getFollowerID() {
        return this.data.f.id;
    }

    static encode(userInfo: Follower, child: ChildInfoFollower, platform: string): ApiResponseObject {

        let c = new ApiResponseObject();
        c.c = child.indexForTeacher;
        c.data.f.id = userInfo.idOnTeacherApp;
        c.data.f.p = userInfo.push ? encodeURI(userInfo.push.push) : null;
        c.data.f.i = userInfo.push ? encodeURI(userInfo.push.id) : null;
        c.data.f.pf = encodeURI(platform);

        return c;
    }

    static decode(data: ApiResponseObject): [number, number, OneSignalIds] {
        let ids = new OneSignalIds();
        ids.id = decodeURI(data.data.f.i);
        ids.platform = decodeURI(data.data.f.pf);
        ids.push = decodeURI(data.data.f.p);
        return [data.c, data.data.f.id, ids];
    }

    static toString(obj: ApiResponseObject): string {
        return `${obj.v}${obj.op}${obj.c}${obj.data.f.i}${obj.data.f.id}${obj.data.f.p}${obj.data.f.pf}`;
    }
}


export class ApiAgendaObject extends SignMessage {
    v: number = VERSION;
    op: number = ApiOp.AGENDA_SEND;
    c: number; // Child index
    /**
     * Data for payload. Encapsuled to be easy cipher and decipher
     */
    data: any = {
        // Event title
        et: "", 
        // Event description
        ed: "",
        // Day of agenda
        d: "", 
        // Nappy
        tn: false,
        // Wiper
        tw: false,
        // Clothes
        tc: false,
        // Water
        twa: false,
        // Mood
        m: "",
        // Poo Times
        pv: 0,
        // Poo Type
        pt: "", 
        // Breakfast quality
        fb: undefined, 
        // Meal quality
        fm: undefined,
         // Ingest quality
        fi: undefined,
        // Comments
        cm: "" 
    }

    static toString(obj: ApiAgendaObject): string {
        return `${obj.v}${obj.op}${obj.c}${obj.data.et}${obj.data.ed}${obj.data.d}${obj.data.tn}${obj.data.tw}${obj.data.tc}${obj.data.twa}${obj.data.m}${obj.data.pv}${obj.data.pt}${obj.data.fb}${obj.data.fm}${obj.data.fi}${obj.data.cm}`;
    }

    static encode(agenda: Agenda, agendaItem: AgendaItem, child: ChildInfoTeacher) {
        let c = new ApiAgendaObject();

        c.c = child.index;
        c.data.et = encodeURI(agenda.event.title);
        c.data.ed = encodeURI(agenda.event.description);
        c.data.d = encodeURI(agenda.day);
        c.data.tn = agendaItem.tomorrow.nappy;
        c.data.tw = agendaItem.tomorrow.wipers;
        c.data.tc = agendaItem.tomorrow.clothes;
        c.data.twa = agendaItem.tomorrow.water;
        c.data.m = encodeURI(agendaItem.mood);
        c.data.pv = agendaItem.poo.times;
        c.data.pt = encodeURI(agendaItem.poo.type);
        c.data.fb = agendaItem.food.breakfast;
        c.data.fm = agendaItem.food.meal;
        c.data.fi = agendaItem.food.ingest;
        c.data.cm = encodeURI(agendaItem.comments);

        return c;
    }

    static decode(json: ApiAgendaObject): [Agenda, AgendaItem] {
        let agenda = new Agenda();
        let agendaItem = new AgendaItem();

        agenda.day = json.data.d;
        agenda.event = new EventDay();
        agenda.event.title = decodeURI(json.data.et);
        agenda.event.description = decodeURI(json.data.ed);

        agendaItem.comments = decodeURI(json.data.cm);
        agendaItem.day = agenda.day;
        agendaItem.food.breakfast = json.data.fb;
        agendaItem.food.meal = json.data.fm;
        agendaItem.food.ingest = json.data.fi;
        agendaItem.mood = getMoodStatus(decodeURI(json.data.m));
        agendaItem.poo.times = json.data.pv;
        agendaItem.poo.type = getpooType(decodeURI(json.data.pt));
        agendaItem.tomorrow.nappy = json.data.tn;
        agendaItem.tomorrow.wipers = json.data.tw;
        agendaItem.tomorrow.clothes = json.data.tc;
        agendaItem.tomorrow.water = json.data.twa;

        return [agenda, agendaItem];
    }
}

export class ApiChildDelete extends SignMessage {
  v = VERSION;
  op = ApiOp.DELETE_CHILD;
  c: number;

  static encode(child: ChildInfoTeacher): ApiChildDelete {
    let c = new ApiChildDelete();
    c.c = child.index;
    return c;
  }

  static decode(data: ApiChildDelete): ChildInfoTeacher {
    let c = new ChildInfoTeacher();
    c.index = data.c;
    return c;
  }

  static toString(obj: ApiChildDelete) {
      return `${obj.v}${obj.op}${obj.c}`;
  }
}