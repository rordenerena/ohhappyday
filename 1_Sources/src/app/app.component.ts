import { TranslateService } from '@ngx-translate/core';
import { TranslateConfigService } from './services/translate-config.service';
import { ProfileType } from './services/database/db.entities';
import { Router } from '@angular/router';
import { DbService } from './services/database/db.service';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { OneSignalService } from './services/onesignal.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private oneSignalService: OneSignalService,
    private db: DbService,
    private router: Router,
    public translate: TranslateService,
    private translateConfig: TranslateConfigService
  ) {
    this.initializeApp();
    let lang = this.translateConfig.getDefaultLanguage();
    this.translate.setDefaultLang(lang);
    this.translate.use(lang);
  }

  async route() {

    if(window.location.pathname === "/") {
      try {
        if (await this.db.isConfigured()) {
          console.log("Configured!");
          let type = await this.db.getProfileType();
  
          if (type === ProfileType.TEACHER) {
            console.log("Teacher");
            this.router.navigate(['/students']);
          } else {
            console.log("Follower");
            this.router.navigate(['/viewer']);
          }
        } else {
          console.log("Not configured!");
          this.router.navigate(['/init']);
        }
      } catch (err) {
        console.error(err);
        this.router.navigate(['/init']);
      }
    }
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.oneSignalService.initConfig();
      await this.route();
    });
  }
}
