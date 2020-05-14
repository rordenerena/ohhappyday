import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileChildPage } from './profile-child.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileChildPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileChildPageRoutingModule {}
