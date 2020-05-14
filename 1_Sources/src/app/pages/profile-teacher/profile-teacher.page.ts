import { Teacher } from '../../services/database/db.entities';
import { Component, OnInit } from '@angular/core';

import { DbService } from '../../services/database/db.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-profile-teacher',
  templateUrl: './profile-teacher.page.html',
  styleUrls: ['./profile-teacher.page.scss'],
})
export class ProfileTeacherPage implements OnInit {

  userInfo: Teacher = new Teacher();
  edit: boolean = false;
  public personalForm: FormGroup;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private db: DbService,
    private route: ActivatedRoute) {
    this.updateForm();
  }

  /**
   * Redo the form object that binding data and
   * operations with the UI
   */
  updateForm() {
    this.personalForm = this.formBuilder.group({
      picture: [this.userInfo.picture],
      name: [this.userInfo.name, Validators.required],
      mail: [this.userInfo.mail, Validators.required]
    });
  }

  ngOnInit() {
    this.getQueryParams();
    this.loadData();
  }

  /**
   * Read the query parameters from URL
   */
  getQueryParams() {
    this.route.queryParams.subscribe(async params => {
      if (params.status && params.status === 'edit') {
        this.edit = true;
      }
    });
  }

  /**
   * Read from DB the stored information for this page,
   * ie, the teacher identity
   */
  async loadData() {
    let data: Teacher = await this.db.getTeacher();

    if (data) {
      Object.assign(this.userInfo, data);
    }
    this.updateForm();
  }

  /**
   * Save the teacher to DB
   */
  async save(userInfo: Teacher) {
    await this.db.setTeacher(userInfo);
  }

  /**
   * Submit form is like: save entity and navigte to next page
   */
  async submitForm(edit: boolean = false) {
    await this.save(Object.assign(this.userInfo, this.personalForm.value));
    if(!edit) {
      this.router.navigate(['/profile-centre']);
    } else {
      this.router.navigate(['/students']);
    }
  }

}
