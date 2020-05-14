import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileFollowerPage } from './profile-follower.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileFollowerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileFollowerPageRoutingModule {}
