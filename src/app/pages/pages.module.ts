import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { DataTablesModule } from 'angular-datatables';
import { SearchComponent } from './search/search.component';



@NgModule({
  declarations: [
    UsuariosComponent,
    SearchComponent
  ],
  imports: [
    CommonModule,
    DataTablesModule
  ]
})
export class PagesModule { }
