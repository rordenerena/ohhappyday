import { TomorrowComponent } from './../../components/agenda/tomorrow/tomorrow.component';
import { PooComponent } from './../../components/agenda/poo/poo.component';
import { MoodComponent } from './../../components/agenda/mood/mood.component';
import { FoodComponent } from './../../components/agenda/food/food.component';
import { DayeventComponent } from './../../components/agenda/dayevent/dayevent.component';
import { CommentsComponent } from './../../components/agenda/comments/comments.component';
import { MenuComponent } from '../../components/agenda/menu/menu.component';
import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewerPageRoutingModule } from './viewer-routing.module';

import { ViewerPage } from './viewer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewerPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    MenuComponent,
    CommentsComponent,
    DayeventComponent,
    FoodComponent,
    MoodComponent,
    PooComponent,
    TomorrowComponent
  ],
  declarations: [ViewerPage]
})
export class ViewerPageModule {}
