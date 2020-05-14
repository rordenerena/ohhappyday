import { RatingComponent } from './agenda/rating/rating.component';
import { CommentsComponent } from './agenda/comments/comments.component';
import { DayeventComponent } from './agenda/dayevent/dayevent.component';
import { FoodComponent } from './agenda/food/food.component';
import { TomorrowComponent } from './agenda/tomorrow/tomorrow.component';
import { PooComponent } from './agenda/poo/poo.component';
import { MoodComponent } from './agenda/mood/mood.component';
import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { MenuComponent } from './agenda/menu/menu.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProfilePictureComponent } from './profile-picture/profile-picture.component';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        Ionic4DatepickerModule
    ],
    declarations: [
        ProfilePictureComponent, 
        MenuComponent, 
        DatepickerComponent,
        MoodComponent,
        PooComponent,
        TomorrowComponent,
        FoodComponent,
        DayeventComponent,
        CommentsComponent,
        RatingComponent
    ],
    exports: [
        ProfilePictureComponent, 
        MenuComponent, 
        DatepickerComponent, 
        MoodComponent, 
        PooComponent,
        TomorrowComponent,
        FoodComponent,
        DayeventComponent,
        CommentsComponent,
        RatingComponent
    ]
})
export class ComponentsModule {}