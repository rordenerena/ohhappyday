import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateConfigService {

  constructor(
    private translate: TranslateService
  ) { 

    let lang = this.getDefaultLanguage();
  }

  getDefaultLanguage(){
    let language = this.translate.getBrowserLang();
    console.log("Lang: ", language);
    this.translate.setDefaultLang(language);
    return language;
  }

  setLanguage(setLang) {
    this.translate.use(setLang);
  }

}