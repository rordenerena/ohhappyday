import { DbService } from '../../services/database/db.service';
import { OneSignalService } from './../../services/onesignal.service';
import { PairingService } from './../../services/comm/pairing.service';
import { ToastService } from './../../services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { FormGroup } from '@angular/forms';
import { Agenda, AgendaItem, ChildInfoFollower } from '../../services/database/db.entities';
import { MenuComponent } from '../../components/agenda/menu/menu.component';
import { Component, OnInit, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.page.html',
  styleUrls: ['./viewer.page.scss'],
})
export class ViewerPage implements OnInit {

  entity: ChildInfoFollower;
  agenda: Agenda = new Agenda();
  agendaItem: AgendaItem = new AgendaItem();
  protected formData: FormGroup;
  childrens: string[] = null;

  // Navigation
  private swipeCoord?: [number, number];
  private swipeTime?: number;
  private next: number = 0;
  private previous: number = 0;
  nav: string = "";
  ids = [];
  slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  constructor(private route: ActivatedRoute,
    private router: Router,
    private db: DbService,
    public popoverController: PopoverController,
    public toastService: ToastService,
    private pairingService: PairingService,
    private onesignal: OneSignalService,
    private changeDetector: ChangeDetectorRef) {
    this.onesignal.change.subscribe(async (event) => {
      debugger;
      if (event.page === 'viewer') {
        await this.startupNext(event.data.child, undefined);
      } else if (event.page === 'agenda') {
        if (event.data.child === this.entity.index && event.data.day === this.agenda.day) {
          // this.startupNext(event.data.child, event.data.day);
          await this.loadAgendaFor(event.data.day);
          this.changeDetector.detectChanges();

        }
      }
    })
  }

  async ngOnInit() {
    this.startup();
  }

  ionViewWillEnter() {
    this.startup();
  }

  /**
   * Callback for datepicker change
   * @param day 
   */
  changeDate(day: string) {
    this.updateAgenda(day);
  }

  /**
   * Set some classes in order to animate the UI
   * when there arent agenda for this day
   */
  animate() {
    try {
      if (this.agendaItem == null) {
        let el = document.getElementById("toanim");
        if (el) {
          el.classList.add("anim");
          setTimeout(() => {
            let el = document.getElementById("toanim");
            if (el) el.classList.remove("anim");
          }, 300);
        }
      }
    } catch (ex) {
      //
    }
  }

  /**
   * Load the agenda from DB for a specific day
   */
  async updateAgenda(day: string) {
    if (this.entity) {
      if (day) {
        await this.loadAgendaFor(day);
      } else {
        await this.loadAgendaFor(this.agenda.day);
      }
      this.animate();
    }

  }

  /**
   * Load the needed information reading the query parameters
   * from URL
   */
  async startup() {
    console.log("Startup");
    // TODO: Cargar la agenda (titulo, description)
    this.route.queryParams.subscribe(async params => {
      this.startupNext(params.child, params.day);
    });
  }

  /**
   * Default behaviour when query parameters have been read.
   * Show the agenda for a child if not exists, navigate
   * to a correct page.
   * @param index 
   * @param day 
   */
  async startupNext(index: number, day: string) {
    let childrens = await this.db.getChildIds();
    if (index) {
      let child = index ? index : parseInt(childrens[0], 10);
      this.entity = <ChildInfoFollower>await this.db.getChild(child);
      if (this.entity) {
        await this.setNextAndPrevious(this.entity.index);
        await this.updateAgenda(day);
      } else {
        this.router.navigate(['/']);
      }
    } else {
      if (childrens.length > 0) {
        this.router.navigate(['/viewer'], { queryParams: { child: childrens[0] } });
      } else {
        this.router.navigate(['/'])
      }
    }
    this.childrens = childrens;
    this.changeDetector.detectChanges();
  }

  /**
   * Go to profile children page
   */
  toProfile() {
    this.router.navigate(['/profile-child'], { queryParams: { child: this.entity.index } });
  }

  /**
   * Auxiliary method for the UI in order to know if 
   * there are childs to be showed.
   * 
   * The empty view take care of this method.
   */
  areChilds() {
    let re = this.childrens != null ? this.childrens.length > 0 : false;
    return re;
  }

  /**
   * Load agenda for a specific day
   */
  async loadAgendaFor(day: string) {
    let agenda = await this.db.getAgenda(day, this.entity.teacher);

    if (agenda !== null) {
      this.agenda = agenda;
      this.agendaItem = this.agenda.children[this.entity.index];
      console.log(this.entity, this.agenda, this.agendaItem);
    } else {
      this.agenda = new Agenda(day);
      this.agendaItem = null;
    }
  }

  /**
   * Auxiliary method for the UI in order to configure and show
   * the menu for this page.
   */
  async showMenu(ev: any) {
    let options = {
      "profile-child": `Perfil de ${this.entity.name}`,
      "add-children": "Añadir nuevo hij@ (QR)",
      "sent-pushids": "Reenviar IDs de comunicación",
      "about": "Acerca de"
    };
    if (!environment.production) {
      options["to-agenda"] = "DEV: Ver agenda de profesor";
    }
    const popover = await this.popoverController.create({
      component: MenuComponent,
      componentProps: options,
      event: ev
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    console.log(data);
    switch (data.op) {
      case 'profile-child':
        this.toProfile();
        break;
      case 'add-children':
        this.scan();
        break;
      case 'sent-pushids':
        (await this.db.getChildrens()).forEach(async element => {
          this.pairingService.updateResponse(await this.db.getFollower(), element);
        });
        this.toastService.toast("Enviados identificadores de comunicación")
        break;
      case "to-agenda":
        this.router.navigate(['/agenda'], { queryParams: { child: this.entity.index, day: this.agenda.day } });
        break;
      case "about":
        this.router.navigate(['/about']);
        break;
    }
  }

  /**
   * Navigate to the scan qr code page.
   */
  scan() {
    this.router.navigate(['/scanqr']);
  }

  /**
   * Set the next and previous children id to be easy
   * the management of swipe navigation.
   */
  async setNextAndPrevious(value: number) {
    this.ids = await this.db.getChildIds();
    let pos = this.ids.indexOf(`${value}`);

    this.slideOpts.initialSlide = pos;

    if (pos == (this.ids.length - 1)) {
      this.next = parseInt(this.ids[0], 10);
    } else {
      this.next = parseInt(this.ids[pos + 1], 10);
    }
    if (pos == 0) {
      this.previous = parseInt(this.ids[this.ids.length - 1], 10);
    } else {
      this.previous = parseInt(this.ids[pos - 1], 10);
    }

    console.log(this);
  }

  /**
   * Navigate to the viewer for a specific child and day
   */
  navigateChild(index: number, day = this.agenda.day) {
    this.router.navigate(['/viewer'], { queryParams: { child: index, day: day } });
  }


  /****************** NAVIGATION SWIPE */
  isNavLeft() {
    this.cancelNav();
    return (this.nav === "previous") ? "animationNav" : "";
  }

  isNavRight() {
    this.cancelNav();
    return (this.nav === "next") ? "animationNav" : "";
  }

  isNaving() {
    return this.nav !== "";
  }

  cancelNav() {
    setTimeout(() => {
      this.nav = "";
    }, 500);
  }

  swipe(e: TouchEvent, when: string): void {
    if(this.areChilds() && this.childrens.length > 1) {
      const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
      const ttime = new Date().getTime();
      if (when === 'start') {
        this.swipeCoord = coord;
        this.swipeTime = ttime;
      } else if (when === 'end') {
        const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
        const duration = ttime - this.swipeTime;
  
        if (duration < 1000 //
          && Math.abs(direction[0]) > 30 // Long enough
          && Math.abs(direction[0]) > Math.abs(direction[1] * 3)) { // Horizontal enough
          
          const swipe = direction[0] < 0 ? 'next' : 'previous';
          // Do whatever you want with swipe
          this.nav = swipe;
          if (swipe === 'next') {
            this.navigateChild(this.next);
          } else {
            this.navigateChild(this.previous);
          }
        }
      }
    }
  }
}
