import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesRoutingModule } from './pages/pages-routing.module';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth/auth-routing.module';
import { RegisterPymeComponent } from './auth/register-pyme/register-pyme.component';
import { LoginPymeComponent } from './auth/login-pyme/login-pyme.component';

const routes: Routes = [
  {path:'' ,redirectTo:'login', pathMatch:'full'},
  { path: 'register-pyme', component: RegisterPymeComponent },
  { path: 'login-pyme', component: LoginPymeComponent },
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
