import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { ErrorService } from 'src/app/services/error.service';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  menuItems:any[]=[];
  userName: string = '';
  listObjetos: Objetos [] = [];

  constructor(private _sideBarService: SidebarService, 
    private router:Router,
    private _objetos: ObjetosService,
    private _errorService: ErrorService){
    //this.menuItems2 = this.sideBarService.empresas;
  }

  ngOnInit(): void {
    this.getObjetos();
    this.menuItems = this._sideBarService.menu;
    /*
    this.menuItems = this._sideBarService.menu;
    const local = localStorage.getItem('usuario');
    if(local !== null){
      this.userName = local;
    };*/
  }

  logout(){
    this.router.navigateByUrl('/login');
    localStorage.clear();
  }
  getObjetos(){
    this._objetos.getAllObjetos().subscribe({
      next: (data: any) => {
        console.log(data);
        this.listObjetos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
}
