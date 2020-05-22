import { TranslateModule } from '@ngx-translate/core';
import { MenuComponent } from './../../components/agenda/menu/menu.component';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileChildPageRoutingModule } from './profile-child-routing.module';

import { ProfileChildPage } from './profile-child.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileChildPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ProfileChildPage],
  entryComponents: [MenuComponent]
})
export class ProfileChildPageModule {}
