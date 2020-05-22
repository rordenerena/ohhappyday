import { OneSignalService } from './../../services/onesignal.service';
import { environment } from './../../../environments/environment';
import { MenuComponent } from './../../components/agenda/menu/menu.component';
import { AgendaService } from './../../services/comm/agenda.service';
import { ToastService } from './../../services/toast.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from '../../services/database/db.service';
import { ChildInfoTeacher, Agenda, AgendaItem } from '../../services/database/db.entities'
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, enableProdMode, ChangeDetectorRef } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

  entity: ChildInfoTeacher = new ChildInfoTeacher();
  agenda: Agenda = new Agenda();
  agendaItem: AgendaItem = new AgendaItem();
  public formData: FormGroup;
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
    private formBuilder: FormBuilder,
    private db: DbService,
    public popoverController: PopoverController,
    private toastService: ToastService,
    private agendaService: AgendaService,
    public san: DomSanitizer) {
    this.createForm();
  }

  ngOnInit() {
    // TODO: Cargar la agenda (titulo, description)
    this.route.queryParams.subscribe(async params => {
      if (params.child) {
        this.entity = <ChildInfoTeacher>await this.db.getChild(params.child);
        this.setNextAndPrevious(params.child);
        if (!this.entity) {
          this.router.navigate(['/students']);
        }
        if (params.day) {
          this.loadAgendaFor(params.day);
        } else {
          this.loadAgendaFor(this.agenda.day);
        }
      } else {
        this.router.navigate(['/students']);
      }
    });
  }

  /**
   * Set the next and the previous children id
   * to be easy the navigation between childrens
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
  }

  /**
   * Make the form object to binding and manage operations
   * for/from UI
   */
  createForm() {
    this.formData = this.formBuilder.group({
      day: [this.agenda.day, Validators.required],
      dayevent: [this.agenda.event],
      tomorrow: [this.agendaItem.tomorrow, Validators.required],
      mood: [this.agendaItem.mood, Validators.required],
      poo: [this.agendaItem.poo, Validators.required],
      food: [this.agendaItem.food, Validators.required],
      comments: [this.agendaItem.comments, Validators.required],
    });
  }

  /**
   * Navigate to the agenda for a specific child and specific day
   * 
   * default day is the day loaded at the view
   */
  navigateChild(index: number, day = this.agenda.day) {
    this.router.navigate(['/agenda'], { queryParams: { child: index, day: day } });
  }

  /**
   * Set the agenda and agendaitem when information
   * from form have changed.
   */
  updateForm() {
    this.createForm();
    this.formData.valueChanges.subscribe(async (params) => {
      if (this.agenda.day !== params.day) {
        // El día ha cambiado, así que hay que limpiar el formulario y cargarlo de nuevo
        this.navigateChild(this.entity.index, params.day);
        this.agenda = new Agenda(params.day);
        this.agendaItem = new AgendaItem(params.day);
      } else {
        this.agenda.day = params.day;
        this.agenda.event = params.dayevent;
        this.agendaItem.tomorrow = params.tomorrow;
        this.agendaItem.mood = params.mood;
        this.agendaItem.poo = params.poo;
        this.agendaItem.food = params.food;
        this.agendaItem.comments = params.comments;

        this.db.setAgenda(this.agenda, await this.db.getTeacher());
      }
    });
  }

  /**
   * Navigate to the profile child page
   */
  toProfile() {
    this.router.navigate(['/profile-child'], { queryParams: { child: this.entity.index } });
  }

  /**
   * Load from DB the agenda and agendaItem for a specific day
   */
  async loadAgendaFor(day: string) {
    let agenda = await this.db.getAgenda(day, await this.db.getTeacher());

    if (agenda !== null) {
      this.agenda = agenda;
    } else {
      this.agenda.day = day;
    }

    this.agenda.children[this.entity.index] = this.agenda.children[this.entity.index] ? this.agenda.children[this.entity.index] : new AgendaItem(this.agenda.day);
    this.agendaItem = this.agenda.children[this.entity.index];
    console.log(this.entity, this.agenda, this.agendaItem);

    this.updateForm();
  }

  /**
   * Swipe navigation auxiliary method
   */
  swipe(e: TouchEvent, when: string): void {
    if(this.ids && this.ids.length > 1) {
      const coord: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
      const time = new Date().getTime();
  
      if (when === 'start') {
        this.swipeCoord = coord;
        this.swipeTime = time;
      } else if (when === 'end') {
        const direction = [coord[0] - this.swipeCoord[0], coord[1] - this.swipeCoord[1]];
        const duration = time - this.swipeTime;
  
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

  /**
   * Get if the navigation is for left/previous
   */
  isNavLeft() {
    this.cancelNav();
    return (this.nav === "previous") ? "animationNav" : "";
  }

  /**
   * Get if the navigation is for right/next
   */
  isNavRight() {
    this.cancelNav();
    return (this.nav === "next") ? "animationNav" : "";
  }

  /**
   * Get if the navigation is being done
   */
  isNaving() {
    return this.nav !== "";
  }

  /**
   * Cancel the navigation flag
   */
  cancelNav() {
    setTimeout(() => {
      this.nav = "";
    }, 500);
  }

  /**
   * Send agenda for the followers of child
   */
  sendAgenda() {
    this.agendaService.sendAgenda(this.agenda, this.agendaItem, this.entity);
    this.toastService.toast("Agenda enviada a familiares");
  }

  /**
   * Auxiliary method in order to configure and show the
   * menu option for this page.
   */
  async showMenu(ev: any) {
    let options = {
      "profile-child": "Perfil del alumno",
      "settings":"Preferencias"
    };
    if (!environment.production) {
      options["viewer"] = "DEV: Visor de Follower";
    }
    const popover = await this.popoverController.create({
      component: MenuComponent,
      componentProps: options,
      event: ev
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();

    if(data && data.op) {
      switch (data.op) {
        case "profile-child":
          this.toProfile();
          break;
        case "viewer":
          this.router.navigate(['/viewer'], { queryParams: { child: this.entity.index, day: this.agenda.day } });
          break;
        default:
            this.router.navigate([`/${data.op}`]);
          break;
      }
    }
  }

}
