import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesRoutingModule } from './pages/pages-routing.module';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth/auth-routing.module';

const routes: Routes = [
  {path:'' ,redirectTo:'login', pathMatch:'full'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    PagesRoutingModule,
    AuthRoutingModule,
    CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
