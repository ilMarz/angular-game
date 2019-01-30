import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BattlefieldComponent } from './battlefield/battlefield.component';
import { HomeComponent } from './home/home.component';
import { GuardGuard } from './guard.guard'

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'play', component: BattlefieldComponent,canActivate: [GuardGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
