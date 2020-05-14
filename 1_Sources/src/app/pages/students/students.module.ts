import { MenuComponent } from './../../components/agenda/menu/menu.component';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudentsPageRoutingModule } from './students-routing.module';

import { StudentsPage } from './students.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudentsPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StudentsPage],
  entryComponents: [
    MenuComponent
  ]
})
export class StudentsPageModule {}
