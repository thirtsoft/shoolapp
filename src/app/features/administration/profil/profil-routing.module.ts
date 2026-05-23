import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProfilComponent } from './pages/create-profil/create-profil.component';
import { ListProfilComponent } from './pages/list-profil/list-profil.component';

const routes: Routes = [
  //  { path: '', redirectTo: 'all', pathMatch: 'full' },
  {
    path: 'create',
    component: CreateProfilComponent
  },
  {
    path: 'edit/:id',
    component: CreateProfilComponent
  },
  {
    path: 'all',
    component: ListProfilComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilRoutingModule { }
