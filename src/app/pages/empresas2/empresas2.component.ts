import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { ContactoDirecciones } from 'src/app/interfaces/contacto/contactoDirecciones';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { OperacionEmpresasService } from 'src/app/services/empresa/operacion-empresas.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-empresas2',
  templateUrl: './empresas2.component.html',
  styleUrls: ['./empresas2.component.css']
})
export class Empresas2Component implements OnInit{


  //DATATABLES
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};

  //LISTAS DE VECTORES
  listOpEmpresa: any[] = [];
  listContactos: Contacto[] = [];
  listContactosDirecciones: ContactoDirecciones[] = [];
  listContactosTelefonos: ContactoTelefono[] = [];

  idOpEmpresas: number = 0;
  
  constructor(
    private _opEmpresasService: OperacionEmpresasService,
    private _contactosService: ContactoService,
    private _toastr: ToastrService,
    private _ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
  ) {}


  ngOnInit(): void {
    this.getOpEmpresas();
    this.getDirecciones();
    this.getTelefonos();
  }

  getOpEmpresas(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    };
      this._opEmpresasService.getAllOpEmpresas()
      .subscribe((res: any) => {
        this.listOpEmpresa = res;
        this.dtTrigger.next(0);
      });
  }
  getContactos(id: string){
    const dni = id.toString();
    console.log(dni)
    if(dni !== undefined){
      this._contactosService.getContactoID(dni.toString()).subscribe({
        next: (data) => {
          this.listContactos = data;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
  getDirecciones(){}
  getTelefonos(){}

  pushEmpresas(){}
  pushContactos(){}
  pushDirecciones(){}
  pushTelefonos(){}

  updateEmpresas(){}
  updateContactos(){}
  updateDirecciones(){}
  updateTelefonos(){}

  deleteEmpresas(){}
  deleteContactos(){}
  deleteDirecciones(){}
  deleteTelefonos(){}

  obtenerIdOpEmpresa(dni: any) {
   this.getContactos(dni);
  }
}
