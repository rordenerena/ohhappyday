import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileCentrePage } from './profile-centre.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileCentrePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileCentrePageRoutingModule {}
