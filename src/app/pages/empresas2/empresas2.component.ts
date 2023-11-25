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
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { DatePipe } from '@angular/common';
import { TipoDireccion } from 'src/app/interfaces/mantenimiento/tipoDireccion';



@Component({
  selector: 'app-empresas2',
  templateUrl: './empresas2.component.html',
  styleUrls: ['./empresas2.component.css']
  
})
export class Empresas2Component implements OnInit{

  //Contacto
  nuevoContacto: Contacto = {
    id_contacto: 0,
    id_tipo_contacto: 0,
    dni: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,
  };

  //Direcion
  nuevaDireccion: ContactoDirecciones = {
    id_direccion: 0, 
    id_contacto: 0, 
    id_tipo_direccion: 0,
    direccion:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };

  //Telefonos
  contactoTEditando: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: '', 
    extencion: '',
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  //DATATABLE
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};

  tip: TipoDireccion[] = [];
  Alltipocontacto: any[] = [];
  con: Contacto[] = []

  //INDICES
  indice: any;

  //LISTAS DE VECTORES
  listOpEmpresa: any[] = [];
  listContactos: Contacto[] = [];
  listDirecciones: ContactoDirecciones[] = [];
  listContactosTelefonos: ContactoTelefono[] = [];
  listEmpresa: Empresa[] = [];
  listTipoC: TipoDireccion[] = [];
  listContactoT: ContactoTelefono[] = [];


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

  contactoEditando: Contacto = {
    id_contacto: 0,
    id_tipo_contacto: 0,
    dni: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,
  };

  direccionEditando: ContactoDirecciones = {
    id_direccion: 0, 
    id_contacto: 0, 
    id_tipo_direccion: 0,
    direccion:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };

  nuevoContactoT: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: '', 
    extencion: '',
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  //TITULO MODAL CONTACTOS
  nombre_empresa: string = '';

  idOpEmpresas: number = 0;
  ngZone: any;
  
  constructor(
    private _opEmpresasService: OperacionEmpresasService,
    private _empresaService: EmpresaService,
    private _contactosService: ContactoService,
    private _direccionesService: DireccionesService,
    private _tipoDService: DireccionesService,
    private _telefonosService: ContactoTService,
    private _toastr: ToastrService,
    private _ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _contactoService: ContactoService, 
    private toastr: ToastrService,
    private _datePipe: DatePipe,
    private _objService: DireccionesService,
    private _contactoTService: ContactoTService,
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
        this.listDirecciones = data;
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

  //CODIGO PARA CONTACTOS

  toggleFunctionContacto(contacto: any, i: number) {

    // Ejecuta una función u otra según el estado
    if (contacto.estado === 1 ) {
      this.inactivarContacto(contacto, i); // Ejecuta la primera función
    } else {
      this.activarContacto(contacto, i); // Ejecuta la segunda función
    }
  }


  inactivarContacto(contacto: Contacto, i: any){
    this._contactosService.inactivarContacto(contacto).subscribe(data => 
    this._toastr.success('El contacto: '+ contacto.primer_nombre + ' ha sido inactivado')
    );
    this.listContactos[i].estado = 2; 
  }
  activarContacto(contacto: Contacto, i: any){
    this._contactosService.activarContacto(contacto).subscribe(data => 
    this._toastr.success('El contacto: '+ contacto.primer_nombre + ' ha sido activado')
    );
    this.listContactos[i].estado = 1;
  }
  editarContacto(){
    console.log(this.contactoEditando)
    this._contactoService.editarContacto(this.contactoEditando).subscribe({
      next: (data: any) => {
        this.toastr.success('contacto editado con éxito', 'Éxito');
        this.listContactos[this.indice].dni = this.contactoEditando.dni;
        this.listContactos[this.indice].primer_nombre = this.contactoEditando.primer_nombre;
        this.listContactos[this.indice].segundo_nombre = this.contactoEditando.segundo_nombre;
        this.listContactos[this.indice].primer_apellido = this.contactoEditando.primer_apellido;
        this.listContactos[this.indice].segundo_apellido = this.contactoEditando.segundo_apellido;
        this.listContactos[this.indice].correo = this.contactoEditando.correo;
        this.listContactos[this.indice].descripcion = this.contactoEditando.descripcion;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  agregarNuevoContacto() {
    
    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
      const fechaActual = new Date();
    const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
    this.nuevoContacto = {
      id_contacto: 0,
      id_tipo_contacto: 6, 
      dni: this.nuevoContacto.dni,
      primer_nombre: this.nuevoContacto.primer_nombre,
      segundo_nombre: this.nuevoContacto.segundo_nombre, 
      primer_apellido: this.nuevoContacto.primer_apellido,
      segundo_apellido: this.nuevoContacto.segundo_apellido,   
      correo:this.nuevoContacto.correo,
      descripcion:this.nuevoContacto.descripcion,
      creado_por: userLocal,
      fecha_creacion: fechaFormateada as unknown as Date, // Convertir la cadena a Date, 
      modificado_por: userLocal, 
      fecha_modificacion: fechaFormateada as unknown as Date, // Convertir la cadena a Date,
      estado: 1,

    };
  
    this._contactoService.addContacto(this.nuevoContacto).subscribe({
      next: (data) => {
        this.listContactos.push(this.nuevoContacto)
        this.toastr.success('Contacto Agregado Exitosamente')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  }


  obtenerIdContacto(contac: Contacto, i: any){
    this.contactoEditando = {
      id_contacto: contac.id_contacto,
      id_tipo_contacto: contac.id_tipo_contacto,
      dni: contac.dni,
      primer_nombre: contac.primer_nombre,
      segundo_nombre: contac.segundo_nombre,
      primer_apellido: contac.primer_apellido,
      segundo_apellido: contac.segundo_nombre,
      correo: contac.correo,
      descripcion: contac.descripcion,
      creado_por: contac.creado_por,
      fecha_creacion: contac.fecha_creacion, 
      modificado_por: contac.modificado_por,
      fecha_modificacion: contac.fecha_modificacion, 
      estado: contac.estado,

    };
    this.indice = i;
  }

  //Cogido para direcciones
  toggleFunctionD(obj: any, i: number) {

    // Ejecuta una función u otra según el estado
    if (obj.estado === 1 ) {
      this.inactivarDireccion(obj, i); // Ejecuta la primera función
    } else {
      this.activarDireccion(obj, i); // Ejecuta la segunda función
    }
  }
    
  inactivarDireccion(direccion: ContactoDirecciones, i: any){
    this._objService.inactivarDireccion(direccion).subscribe(data => 
      this.toastr.success('La Direccion: '+ direccion.direccion+ ' ha sido inactivada')
      );
    this.listDirecciones[i].estado = 2;
  }
  activarDireccion(direccion: ContactoDirecciones, i: any){
    this._objService.activarDireccion(direccion).subscribe(data => 
    this.toastr.success('La Direccion: '+ direccion.direccion+ ' ha sido activada')
    );
    this.listDirecciones[i].estado = 1;
  }
  
  agregarNuevaDireccion() {

    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevaDireccion = {
        id_direccion: 0, 
        id_contacto: this.nuevaDireccion.id_contacto,
        id_tipo_direccion: this.nuevaDireccion.id_tipo_direccion, 
        direccion: this.nuevaDireccion.direccion, 
        descripcion:this.nuevaDireccion.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date()

      };


    
      this._objService.addDireccion(this.nuevaDireccion).subscribe({
        next: (data) => {
          this.toastr.success('Direccion agregado con éxito')
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
      location.reload();
      this.ngZone.run(() => {        
      });
    }
  }
  


  obtenerIdDireccion(direccion: ContactoDirecciones, i: any){
    this.direccionEditando = {
    id_direccion: direccion.id_direccion,
    id_contacto: direccion.id_contacto,
    id_tipo_direccion: this.nuevaDireccion.id_tipo_direccion, 
    direccion: direccion.direccion, 
    descripcion: direccion.descripcion,  
    creado_por: direccion.creado_por, 
    fecha_creacion: direccion.fecha_creacion, 
    modificado_por: direccion.modificado_por, 
    fecha_modificacion: direccion.fecha_modificacion,
    estado: direccion.estado

    };
    this.indice = i;
  
  }


  editarDireccion(con: any) {
    
    this._objService.editarDireccion(this.direccionEditando).subscribe(data => {
      this.toastr.success('Direccion editado con éxito');
      if(this.Alltipocontacto == null){
        //no se puede editar el usuario
      }else{
      this.Alltipocontacto[this.indice].direccion = this.direccionEditando.direccion;
      this.Alltipocontacto[this.indice].descripcion = this.direccionEditando.descripcion;
      this.Alltipocontacto[this.indice].contacto.con = con.con;
       // Recargar la página
       location.reload();
      }

    });
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

 //CODIGO PARA Telefonos
 toggleFunctionContactoTelefono(telefono: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (telefono.estado === 1 ) {
    this.inactivarContactoTelefono(telefono, i); // Ejecuta la primera función
  } else {
    this.activarContactoTelefono(telefono, i); // Ejecuta la segunda función
  }
}


inactivarContactoTelefono(telefono: ContactoTelefono, i: any){
  this._telefonosService.inactivarContactoTelefono(telefono).subscribe(data => 
  this._toastr.success('El telefono: '+ telefono.telefono + ' ha sido inactivado')
  );
  this.listContactosTelefonos[i].estado = 2; 
}
activarContactoTelefono(contactot: ContactoTelefono, i: any){
  this._telefonosService.activarContactoTelefono(contactot).subscribe(data => 
  this._toastr.success('El telefono: '+ contactot.telefono + ' ha sido activado')
  );
  this.listContactosTelefonos[i].estado = 1;
}
agregarNuevoContactoT() {

  const userLocal = localStorage.getItem('usuario');
  if (userLocal){
  this.nuevoContactoT = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: this.nuevoContactoT.telefono, 
    extencion: this.nuevoContactoT.extencion,
    descripcion:this.nuevoContactoT.descripcion,
    creado_por: userLocal,
    fecha_creacion: new Date(), 
    modificado_por: userLocal,
    fecha_modificacion: new Date(),
    estado: 0,
  };

  this._contactoTService.addContactoT(this.nuevoContactoT).subscribe({
    next: (data) => {
      //this.insertBitacora(data);
      this.toastr.success('Contacto agregado con éxito');
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
  location.reload();
  this.ngZone.run(() => {        
  });
}
}


obtenerIdContactoT(contactoT: ContactoTelefono, i: any){
  this.contactoTEditando = {
    id_telefono: contactoT.id_telefono, 
    id_contacto: contactoT.id_contacto,
    id_tipo_telefono: contactoT. id_tipo_telefono,
    telefono: contactoT.telefono, 
    extencion: contactoT.extencion,
    descripcion: contactoT.descripcion,
    creado_por: contactoT.creado_por, 
    fecha_creacion: contactoT.fecha_creacion, 
    modificado_por: contactoT.modificado_por, 
    fecha_modificacion: contactoT.fecha_modificacion,
    estado: contactoT.estado,
  

  };
  this.indice = i;
}


editarContactoTelefono(){
  this._contactoTService.editarContactoTelefono(this.contactoTEditando).subscribe(data => {
    this.toastr.success('contacto editado con éxito');
    this.listContactoT[this.indice].telefono = this.contactoTEditando.telefono;
    this.listContactoT[this.indice].extencion = this.contactoTEditando.extencion;
    this.listContactoT[this.indice].descripcion = this.contactoTEditando.descripcion;

    
      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
  
  });
}

}



  