import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileFollowerPageRoutingModule } from './profile-follower-routing.module';

import { ProfileFollowerPage } from './profile-follower.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileFollowerPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [ProfileFollowerPage]
})
export class ProfileFollowerPageModule {}
