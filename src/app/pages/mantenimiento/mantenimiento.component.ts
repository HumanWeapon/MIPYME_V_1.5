import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { ErrorService } from 'src/app/services/error.service';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css']
})
export class MantenimientoComponent implements OnInit {

  tipo_objeto: string = 'MANTENIMIENTO';
  estado_objeto: number = 1;
  listObjetos: any[] = [];
  listObjetos2: any[] = [];
  mostrar: boolean = true;
  submenu: string = "MANTENIMIENTO";
  id_rol: string = '';

  constructor(
    private _seguridadService: ObjetosService,
    private _errorService: ErrorService,
    private _router: Router
    ){

  }


  ngOnInit(): void {
    this.getAllObjetosMenu();
    this.parametrosGetObjetos();
    this.getAllObjetosMenuJSON();
  }

  getAllObjetosMenu(){
    this._seguridadService.getAllObjetosMenu(this.tipo_objeto, this.estado_objeto).subscribe({
      next: (data: any) => {
        this.listObjetos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }

  parametrosGetObjetos(){
    const localIdRol = localStorage.getItem('id_rol');
    if (localIdRol) {
      this.id_rol = localIdRol;
      this.submenu = 'MANTENIMIENTO';
    }
  }

  getAllObjetosMenuJSON(){
    this._seguridadService.objetosJSON(this.id_rol, this.submenu).subscribe({
      next: (data: any) => {
        this.listObjetos2 = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }

  navegar(objeto: any) {
    this.mostrar = false;
    this._router.navigate(['/dashboard/'+ objeto.url])
  }
}
