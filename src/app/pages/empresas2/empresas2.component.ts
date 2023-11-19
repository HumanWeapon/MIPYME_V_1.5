import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit, ViewChild  } from '@angular/core';
import { DataTableDirective } from 'angular-datatables/src/angular-datatables.directive';
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

  //DATATABLE
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};

  //INDICES
  indice: any;

  //LISTAS DE VECTORES
  listOpEmpresa: any[] = [];
  listContactos: Contacto[] = [];
  listContactosDirecciones: ContactoDirecciones[] = [];
  listContactosTelefonos: ContactoTelefono[] = [];
  listEmpresa: Empresa[] = [];

  //OBJETOS DE INTERFACES
  empresaEditando: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };

  //TITULO MODAL CONTACTOS
  nombre_empresa: string = '';

  idOpEmpresas: number = 0;
  
  constructor(
    private _opEmpresasService: OperacionEmpresasService,
    private _empresaService: EmpresaService,
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
        this.dtTrigger.next(null);
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


  // Variable de estado para alternar funciones
  toggleFunction(empresa: any, i: number, id_empresa: any) {
    // Ejecuta una función u otra según el estado
    if (empresa === 1 ) {
      this.inactivarEmpresa(i, id_empresa); // Ejecuta la primera función
    } else {
      this.activarEmpresa(i, id_empresa); // Ejecuta la segunda función
    }
  }

  generatePDF() {

    const {jsPDF} = require ("jspdf");
   
    const doc = new jsPDF();
    const data: any[][] =[]
    const headers = ['Nombre Empresa', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];
  
    // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
    this.listEmpresa.forEach((empresa, index) => {
      const row = [
        empresa.nombre_empresa,
        empresa.descripcion,
        empresa.creado_por,
        empresa.fecha_creacion,
        empresa.modificado_por,
        empresa.fecha_modificacion,
        this.getEstadoText(empresa.estado) // Función para obtener el texto del estado
      ];
      data.push(row);
    });
  
    doc.autoTable({
      head: [headers],
      body: data,
    });
  
    doc.output('dataurlnewwindow', null, 'Pymes.pdf');
  }
  
  getEstadoText(estado: number): string {
    switch (estado) {
      case 1:
        return 'ACTIVO';
      case 2:
        return 'INACTIVO';
      default:
        return 'Desconocido';
    }
  }

    onInputChange(event: any, field: string) {
    if (field === 'nombre_empresa' || field === 'descripcion') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }


  activarEmpresa(i: number, id_empresa: any) {
    this._empresaService.activarEmpresa(id_empresa).subscribe({
      next: (data: any) => {
        console.log(data);
        this._toastr.success(data, 'Éxito');
        this.listOpEmpresa[i].empresa.estado = 1;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  inactivarEmpresa(i: number, id_empresa: any) {
    this._empresaService.inactivarEmpresa(id_empresa).subscribe({
      next: (data: any) => {
        console.log(data);
        this._toastr.success(data, 'Éxito');
        this.listOpEmpresa[i].empresa.estado = 2;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  obtenerIdEmpresa(empresa: any, i: any) {
    this.empresaEditando = {
      id_empresa: empresa.empresa.id_empresa,
      id_tipo_empresa: empresa.empresa.id_tipo_empresa,
      nombre_empresa: empresa.empresa.nombre_empresa,
      descripcion:empresa.empresa.descripcion,
      creado_por: empresa.empresa.creado_por,
      fecha_creacion: empresa.empresa.fecha_creacion,
      modificado_por: empresa.empresa.modificado_por,
      fecha_modificacion: empresa.empresa.fecha_modificacion,
      estado: empresa.empresa.estado
    };
    this.indice = i;
  }
  editarEmpresa(){
    this._empresaService.editarEmpresa(this.empresaEditando).subscribe(data => {
      this._toastr.success('Empresa editada con éxito', 'Éxito');
      this.listOpEmpresa[this.indice].empresa.nombre_empresa = this.empresaEditando.nombre_empresa;
      this.listOpEmpresa[this.indice].empresa.descripcion = this.empresaEditando.descripcion;
    });
  }

}
