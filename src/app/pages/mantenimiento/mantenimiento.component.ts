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
  listObjetos: Objetos[] = [];
  mostrar: boolean = true;

  constructor(
    private _seguridadService: ObjetosService,
    private _errorService: ErrorService,
    private _router: Router
    ){

  }


  ngOnInit(): void {
    this.getAllObjetosMenu();
  }

  getAllObjetosMenu(){
    this._seguridadService.getAllObjetosMenu(this.tipo_objeto, this.estado_objeto).subscribe({
      next: (data: any) => {
        this.listObjetos = data;
        console.log(this.listObjetos)
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }

  navegar(url: string) {
    this.mostrar = false;
    this._router.navigate([url])
  }

}
