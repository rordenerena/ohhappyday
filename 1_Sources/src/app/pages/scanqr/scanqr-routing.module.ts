import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScanqrPage } from './scanqr.page';

const routes: Routes = [
  {
    path: '',
    component: ScanqrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanqrPageRoutingModule {}
