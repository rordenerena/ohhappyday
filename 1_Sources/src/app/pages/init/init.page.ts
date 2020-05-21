import { Keys } from './../../services/database/db.entities';
import { DbService } from '../../services/database/db.service';
import { environment } from './../../../environments/environment';
import { Teacher, ProfileType, CentreInfo, ChildInfoTeacher, Follower, ChildInfoFollower } from '../../services/database/db.entities';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-init',
  templateUrl: './init.page.html',
  styleUrls: ['./init.page.scss'],
})
export class InitPage implements OnInit {

  env = environment;

  constructor(private router: Router, private db: DbService) { }

  ngOnInit() {
    
  }

  /**
   * Button "Padres" pressed
   */
  async toViewer() {
    this.db.setProfileType(ProfileType.FOLLOWER);
    this.router.navigate(['/viewer']);
  }

  /**
   * Button "Educador" pressed
   */
  async toTeacher() {
    this.db.setProfileType(ProfileType.TEACHER);
    this.router.navigate(['/profile-teacher']);
  }

  /**
   * Button "Autoconfig" as teacher pressed
   * This button only will be showed when
   * development mode is enabled at config
   */
  async autoConfig() {
    console.log(this.env);
    if (!this.env.production) {

      let teacher = await this.db.getTeacher();
      if (teacher == null) {
        teacher = new Teacher();
        console.error("No existe el objeto y por tanto no hay información para push");
      }
      teacher.mail = "dakotadelnorte@gmail.com";
      teacher.name = "Carlos Orden";
      teacher.platform = "android";
      await this.db.setTeacher(teacher);
      await this.db.setProfileType(ProfileType.TEACHER);

      let centreInfo = new CentreInfo();
      centreInfo.name = "Centro educacional";
      centreInfo.mail = "dakotadelnorte@gmail.com";
      centreInfo.tel = "675158977";
      centreInfo.address = "Online";
      await this.db.setCentreInfo(centreInfo);
      await this.db.setConfigured();


      let sofia = new ChildInfoTeacher();
      sofia.name = "Sofía Orden Díaz";
      sofia.birthdate = "26/08/2017";
      await this.db.setChild(sofia);
      
      let ana = new ChildInfoTeacher();
      ana.name = "Ana Orden Díaz";
      ana.birthdate = "21/03/2020";
      await this.db.setChild(ana);

      let f = new Follower();
      f.name = "Roberto";
      f.mail = "dakotadelnorte@gmail.com";
      f.relationship = "Padre";
      f.tel = "671275689";
      f.index = await this.db.getNext(Keys.FOLLOWER);
      sofia.followers.push(f);
      ana.followers.push(f);
      await this.db.setChild(sofia);
      await this.db.setChild(ana);

      let childf = new ChildInfoFollower();
      childf = Object.assign(childf, sofia);
      childf.teacher = teacher;
      await this.db.setChild(childf);
      
      let childfa = new ChildInfoFollower();
      childfa = Object.assign(childfa, ana);
      childfa.teacher = teacher;
      await this.db.setChild(childfa);

      this.router.navigate(['/students']);
    }
  }

}
