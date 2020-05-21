import { CentreInfo } from '../../services/database/db.entities';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { DbService } from '../../services/database/db.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-profile-centre',
  templateUrl: './profile-centre.page.html',
  styleUrls: ['./profile-centre.page.scss'],
})
export class ProfileCentrePage implements OnInit {

  entityInfo: CentreInfo = new CentreInfo();
  edit: boolean = false;
  viewer: boolean = false;

  public formData: FormGroup;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private db: DbService,
    private route: ActivatedRoute,
    private detectorChange: ChangeDetectorRef) {
    this.updateForm();
  }

  ngOnInit() {
    this.getQueryParams();
  }

  /**
   * Read query parameters from URL
   */
  getQueryParams() {
    this.route.queryParams.subscribe(async params => {
      if (params.status && params.status === 'edit') {
        this.edit = true;
      } else if (params.viewer) {
        this.viewer = true;
      }
      await this.loadData();
      this.detectorChange.detectChanges();
    });
  }

  /**
   * Make the form object to binding data and manage
   * events for/from UI
   */
  updateForm() {
    this.formData = this.formBuilder.group({
      picture: [this.entityInfo.picture],
      name: [this.entityInfo.name, Validators.required],
      mail: [this.entityInfo.mail, Validators.required],
      tel: [this.entityInfo.tel, Validators.required],
      address: [this.entityInfo.address, Validators.required]
    });
  }

  /**
   * Read from DB the entity for this page, is, the centre 
   * information.
   */
  async loadData() {
    let data: CentreInfo = await this.db.getCentreInfo();

    if (data) {
      Object.assign(this.entityInfo, data);
    }
    this.updateForm();
  }

  /**
   * Save into DB the entity of this page
   */
  async save(info: CentreInfo) {
    await this.db.setCentreInfo(info);
  }

  /**
   * Submit form is like:
   * - Save the entity to DB
   * - Set application status as "Configured", in order to avoid 
   * the first configutation pages in following uses
   * - Navigate to the init page for Teacher profile
   */
  submitForm() {
    Promise.all([
      this.save(Object.assign(this.entityInfo, this.formData.value)),
      this.db.setConfigured()
    ]).then(() => {
      // TODO:  Eliminar el historial de navegación una vez naveguemos a students
      this.router.navigate(['/students'], { replaceUrl: true, state: {} });
    }).catch((err) => {
      console.error(err);
    });
  }

}
