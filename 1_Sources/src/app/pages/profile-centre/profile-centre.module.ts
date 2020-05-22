import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ProfileCentrePageRoutingModule } from './profile-centre-routing.module';

import { ProfileCentrePage } from './profile-centre.page';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileCentrePageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [ProfileCentrePage]
})
export class ProfileCentrePageModule {}
