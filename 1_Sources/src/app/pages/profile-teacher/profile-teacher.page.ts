import { ChildInfoFollower } from './../../services/database/db.entities';
import { ViewerPage } from './../viewer/viewer.page';
import { Teacher } from '../../services/database/db.entities';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { DbService } from '../../services/database/db.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-profile-teacher',
  templateUrl: './profile-teacher.page.html',
  styleUrls: ['./profile-teacher.page.scss'],
})
export class ProfileTeacherPage implements OnInit {

  entity: Teacher = new Teacher();
  edit: boolean = false;
  viewer: boolean = false;
  public personalForm: FormGroup;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private db: DbService,
    private route: ActivatedRoute,
    private detectorChange: ChangeDetectorRef) {
    this.updateForm();
  }

  /**
   * Redo the form object that binding data and
   * operations with the UI
   */
  updateForm() {
    this.personalForm = this.formBuilder.group({
      picture: [this.entity.picture],
      name: [this.entity.name, Validators.required],
      mail: [this.entity.mail, Validators.required]
    });
  }

  ngOnInit() {
    this.getQueryParams();
  }

  /**
   * Read the query parameters from URL
   */
  getQueryParams() {
    this.route.queryParams.subscribe(async params => {
      if (params.status && params.status === 'edit') {
        this.edit = true;
        await this.loadData();
      } else if(params.viewer) {
        this.viewer = params.viewer;
        await this.loadData(params.child);
        this.detectorChange.detectChanges();
      }
    });
  }

  /**
   * Read from DB the stored information for this page,
   * ie, the teacher identity
   */
  async loadData(child: any = false) {

    let data: Teacher;

    if(child!==false) {
      let c : ChildInfoFollower = (<ChildInfoFollower> await this.db.getChild(child));
      if(c) {
        data = c.teacher;
      } else {
        this.router.navigate([await this.db.getInitialPage()]);
      }
    } else {
      data = await this.db.getTeacher();
    }


    if (data) {
      Object.assign(this.entity, data);
    }
    this.updateForm();
  }

  /**
   * Save the teacher to DB
   */
  async save(entity: Teacher) {
    await this.db.setTeacher(entity);
  }

  /**
   * Submit form is like: save entity and navigte to next page
   */
  async submitForm(edit: boolean = false) {
    await this.save(Object.assign(this.entity, this.personalForm.value));
    if(!edit) {
      this.router.navigate(['/profile-centre']);
    } else {
      this.router.navigate(['/students']);
    }
  }

}
