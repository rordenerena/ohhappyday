import { environment } from 'src/environments/environment';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

export enum Keys {
    INDEX = 'index',
    PROFILE = 'profile',
    USER_INFO = 'userInfo',
    CENTRE = 'centre',
    CHILDREN = 'children',
    CONFIGURED = 'configured',
    FOLLOWER = 'follower',
    AGENDA = 'agenda'
}

export enum ProfileType {
    TEACHER = 'teacher',
    FOLLOWER = 'follower'
}

export enum MoodStatus {
    FELIZ = "feliz",
    CANSADO = "cansad@",
    TRISTE = "triste",
    MOLESTO = "molest@",
    ENFADADO = "enfadad@"
}

export function getMoodStatus(val: string) {
    if (val === MoodStatus.FELIZ) {
        return MoodStatus.FELIZ;
    } else if (val === MoodStatus.CANSADO) {
        return MoodStatus.CANSADO;
    } else if (val === MoodStatus.TRISTE) {
        return MoodStatus.TRISTE;
    } else if (val === MoodStatus.MOLESTO) {
        return MoodStatus.MOLESTO;
    } else if (val === MoodStatus.ENFADADO) {
        return MoodStatus.ENFADADO;
    } else {
        return null;
    }
};

export enum PooType {
    NORMAL = "normal",
    BLANDA = "soft",
    DIARREA = "diarrhea",
    DURA = "hard"
}

export function getpooType(val: string): PooType {
    if (val === PooType.NORMAL) {
        return PooType.NORMAL;
    } else if (val === PooType.BLANDA) {
        return PooType.BLANDA;
    } else if (val === PooType.DIARREA) {
        return PooType.DIARREA;
    } else if (val === PooType.DURA) {
        return PooType.DURA;
    } else {
        return null;
    }
}

export enum RatingVal {
    GOOD = "good",
    REGULAR = "regular",
    BAD = "bad"
}


export class Index {
    index: number = null;
    uuid: string = uuidv4();

    toPayload() {
        return {
            i: this.index,
            u: this.uuid
        };
    }
}

export class OneSignalIds {
    push: string;
    id: string;
    platform: string;

    toPayload() {
        return {
            p: this.push,
            i: this.id,
            pf: this.platform
        };
    }
}

export class AesKeys {
    secureKey: string;
    secureIV: string;

    constructor() {
        this.secureKey = this.genKey(32);
        this.secureIV = this.genKey(16);
    }

    private genKey(length: number) {
        let sk = uuidv4();
        sk = sk.split("-");
        sk = sk.join("");
        sk = sk.substring(0, length);
        return sk;
    }
}

export class UserBase extends Index {
    name: string = null;
    mail: string = null;
    picture: string = environment.production ? "assets/default-picture.svg" : "assets/example/default-picture.jpg";
    push: OneSignalIds = null;
    platform: string;
    aes: AesKeys = new AesKeys();

    toPayload() {
        let r = super.toPayload();
        r = Object.assign(r, {
            n: this.name,
            m: this.mail,
            pic: this.picture,
            p: this.push.toPayload(),
            pf: this.platform,
            ak: this.aes.secureKey,
            ai: this.aes.secureIV
        });
        return r;
    }
}

export class Follower extends UserBase {
    idOnTeacherApp: number;
    tel: string = null;
    relationship: string = null;

    toPayload() {
        let r = super.toPayload();
        r = Object.assign(r, {
            it: this.idOnTeacherApp,
            t: this.tel,
            rel: this.relationship
        });
        return r;
    }
}

export class Teacher extends UserBase {

}


export class CentreInfo extends Index {
    name: string = null;
    mail: string = null;
    picture: string = environment.production ? "assets/default-centre.svg" : 'assets/example/default-centre.jpg';
    tel: string = null;
    address: string = null;

    toPayload() {
        let r = super.toPayload();
        r = Object.assign(r, {
            n: this.name,
            m: this.mail,
            pic: this.picture,
            tel: this.tel,
            add: this.address
        });
        return r;
    }
}

export class ChildInfo extends Index {
    name: string = null;
    birthdate: string = null;
    picture: string = environment.production ? "assets/baby.svg" : "assets/example/baby.jpg";
    deleted: Boolean = false;

    toPayload() {
        let r = super.toPayload();
        r = Object.assign(r, {
            n: this.name,
            b: this.birthdate,
            pic: this.picture
        });
        return r;
    }
}

export class ChildInfoTeacher extends ChildInfo {
    followers: Follower[] = [];

    toPayload() {
        let r = super.toPayload();
        r = Object.assign(r, {
            f: this.followers,
        });
        return r;
    }
}

export class ChildInfoFollower extends ChildInfo {
    teacher: Teacher = null;
    indexForTeacher: number;

    toPayload() {
        let r = super.toPayload();
        r = Object.assign(r, {
            t: this.teacher,
            it: this.indexForTeacher
        });
        return r;
    }
}

export class EventDay {
    title: string = "";
    description: string = "";

    toPayload() {
        return {
            t: this.title,
            d: this.description
        };
    }
}

export class Agenda {
    day: string = "";
    event: EventDay = new EventDay();
    children = {};

    constructor(day: string = moment().format("DD/MM/YYYY")) {
        this.day = day;
    }

    toPayload() {
        return {
            d: this.day,
            e: this.event.toPayload(),
            c: this.children
        };
    }

    toPayloadOneChildren(index: number) {
        return {
            d: this.day,
            e: this.event.toPayload(),
            c: this.children[index]
        };
    }
}

export class Tomorrow {
    nappy: boolean = false;
    wipers: boolean = false;
    clothes: boolean = false;
    water: boolean = false;

    toPayload() {
        return {
            c: this.clothes,
            n: this.nappy,
            w: this.water,
            wi: this.wipers,
        };
    }
}

export class Poo {
    times: number = 0;
    type: PooType = null;

    toPayload() {
        return {
            t: this.times,
            ty: this.type
        }
    }
}

export class Food {
    breakfast: RatingVal;
    meal: RatingVal;
    ingest: RatingVal;

    toPayload() {
        return {
            b: this.breakfast,
            m: this.meal,
            i: this.ingest,
        }
    }
}

export class AgendaItem {
    owner: number;
    day: string = "";
    tomorrow: Tomorrow = new Tomorrow();
    mood: MoodStatus;
    poo: Poo = new Poo();
    food: Food = new Food();
    comments: string = "";

    constructor(day: string = moment().format("DD/MM/YYYY")) {
        this.day = day;
    }

    toPayload() {
        return {
            o: this.owner,
            d: this.day,
            t: this.tomorrow.toPayload(),
            m: this.mood,
            p: this.poo.toPayload(),
            f: this.food.toPayload(),
            c: this.comments
        };
    }
}