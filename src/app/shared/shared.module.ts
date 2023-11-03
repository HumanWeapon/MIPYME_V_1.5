import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './footer/footer.component';
import { RouterLink } from '@angular/router';



@NgModule({
  declarations: [
    HeaderComponent,
    BreadcrumbsComponent,
    SidebarComponent,
    FooterComponent
  ],
  exports:[
    HeaderComponent,
    BreadcrumbsComponent,
    SidebarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterLink
  ]
})
export class SharedModule { }
