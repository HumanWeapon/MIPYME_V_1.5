import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { ContactoDirecciones } from 'src/app/interfaces/contacto/contactoDirecciones';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { DireccionesService } from 'src/app/services/contacto/direcciones.service';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { OperacionEmpresasService } from 'src/app/services/empresa/operacion-empresas.service';
import { ErrorService } from 'src/app/services/error.service';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-empresas2',
  templateUrl: './empresas2.component.html',
  styleUrls: ['./empresas2.component.css']
})
export class Empresas2Component implements OnInit{


  //DATATABLE EMPRERSAS
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};

  //LISTAS DE VECTORES
  listOpEmpresa: any[] = [];
  listContactos: Contacto[] = [];
  listContactosDirecciones: ContactoDirecciones[] = [];
  listContactosTelefonos: ContactoTelefono[] = [];

  //TITULO MODAL CONTACTOS
  nombre_empresa: string = '';

  idOpEmpresas: number = 0;
  
  constructor(
    private _opEmpresasService: OperacionEmpresasService,
    private _contactosService: ContactoService,
    private _direccionesService: DireccionesService,
    private _telefonosService: ContactoTService,
    private _toastr: ToastrService,
    private _ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
  ) {}


  ngOnInit(): void {
    this.getOpEmpresas();
  }

  getOpEmpresas(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    };
      this._opEmpresasService.getAllOpEmpresas()
      .subscribe((data: any) => {
        this.listOpEmpresa = data;
        this.dtTrigger.next(0);
      });
  }

  getContactos(id: string){
    this._contactosService.getContactoID(id).subscribe({
      next: (data: any) => {
        this.listContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  getDirecciones(id_contacto: any){
    this._direccionesService.getDireccion(id_contacto).subscribe({
      next: (data: any) => {
        this.listContactosDirecciones = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  getTelefonos(id_contacto: any){
    this._telefonosService.getTelefonos(id_contacto).subscribe({
      next: (data: any) => {
        this.listContactosTelefonos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

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

  obtenerIdOpEmpresa(dni: any, nombre_empresa: any, id_contacto:any) {
    console.log(id_contacto);
   this.getContactos(dni);
   this.nombre_empresa = nombre_empresa;
   this.getDirecciones(id_contacto);
   this.getTelefonos(id_contacto);
  }
}
