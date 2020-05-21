import { OneSignalService } from './../../services/onesignal.service';
import { ToastService } from './../../services/toast.service';
import { PairingService } from './../../services/comm/pairing.service';
import { DbService } from '../../services/database/db.service';
import { MenuComponent } from './../../components/agenda/menu/menu.component';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ChildInfo, Agenda } from '../../services/database/db.entities';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {

  students: ChildInfo[] = [];
  rows: Array<number> = [0];
  cols: Array<number> = [0,1,2,3];
  day: string = new Agenda().day;
  

  constructor(private db: DbService,
    private router: Router,
    public popoverController: PopoverController,
    private pairingService: PairingService,
    private toastService: ToastService,
    private oneSignalService: OneSignalService) { 
    
  }

  ngOnInit() {
    this.load();
  }

  ionViewDidEnter() {
    this.load();
  }

  /**
   * Callback executed when datepicker change
   * @param event 
   */
  dpOnChange(event) {
    this.day = event;
  }

  /**
   * Auxiliary method for the UI in order to return
   * a student from array taking the col and row info.
   * @param row 
   * @param col 
   */
  getStudent(row, col) {
    let index = (row*3) + col;
    return this.students[index];
  }

  /**
   * Load the enitties for this page, ie, all
   * childrens stored.
   */
  async load() {
    let childrens = await this.db.getChildrens();
    if(childrens !== null) {
      this.students = Object.values(childrens);
      let r = Math.ceil(this.students.length / this.cols.length);
      this.rows = Array(r).fill(0).map((x,i)=>i);
      this.cols = Array(this.cols.length).fill(0).map((x,i)=>i);
    }
  }


  /**
   * Auxiliary method when a child component at the UI is pressed
   * 
   * Navigate to the agenda for this child
   */
  goTo(index: number) {
    console.log("Navegar a:", index);
    this.router.navigate(['/agenda'], {queryParams: {child: index, day: this.day}});
  }

  /**
   * Auxiliary method for the UI in order to configure and open
   * the menu for this page.
   * 
   * @param ev 
   */
  async showMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: MenuComponent,
      componentProps: {
        "profile-teacher": "Mi perfil",
        "profile-centre": "Centro educacional",
        "resend-pushIds": "Actualizar IDs de comunicación",
        "about": "Acerca de"
      },
      event: ev
    });
    await popover.present();

    const {data} = await popover.onDidDismiss();

    if(data && data.op) {
      switch(data.op) {
        case "resend-pushIds":
          await this.oneSignalService.checkToken(true);
          await this.pairingService.reInvite();
          this.toastService.toast(`Identificadores vigentes enviados a todos los familiares de alumnos`);
          break;
        default:
          this.router.navigate([data.op], {queryParams: {status: 'edit'}});
          break;
      }
    }
  }
 
}
