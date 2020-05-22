import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ProfileTeacherPageRoutingModule } from './profile-teacher-routing.module';

import { ProfileTeacherPage } from './profile-teacher.page';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileTeacherPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [ProfileTeacherPage]
})
export class ProfileTeacherPageModule {}
