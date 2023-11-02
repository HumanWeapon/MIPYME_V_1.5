import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesRoutingModule } from './pages/pages-routing.module';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {path:'' ,redirectTo:'usuarios', pathMatch:'full'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    PagesRoutingModule,
    CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
