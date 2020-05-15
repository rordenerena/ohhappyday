import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: 'init', pathMatch: 'full' },
  {
    path: 'init',
    loadChildren: () => import('./pages/init/init.module').then( m => m.InitPageModule)
  },
  {
    path: 'profile-teacher',
    loadChildren: () => import('./pages/profile-teacher/profile-teacher.module').then( m => m.ProfileTeacherPageModule)
  },
  {
    path: 'profile-centre',
    loadChildren: () => import('./pages/profile-centre/profile-centre.module').then( m => m.ProfileCentrePageModule)
  },
  {
    path: 'profile-child',
    loadChildren: () => import('./pages/profile-child/profile-child.module').then( m => m.ProfileChildPageModule)
  },
  {
    path: 'profile-follower',
    loadChildren: () => import('./pages/profile-follower/profile-follower.module').then( m => m.ProfileFollowerPageModule)
  },
  {
    path: 'students',
    loadChildren: () => import('./pages/students/students.module').then( m => m.StudentsPageModule)
  },
  {
    path: 'agenda',
    loadChildren: () => import('./pages/agenda/agenda.module').then( m => m.AgendaPageModule)
  },
  {
    path: 'viewer',
    loadChildren: () => import('./pages/viewer/viewer.module').then( m => m.ViewerPageModule)
  },
  {
    path: 'scanqr',
    loadChildren: () => import('./pages/scanqr/scanqr.module').then( m => m.ScanqrPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
