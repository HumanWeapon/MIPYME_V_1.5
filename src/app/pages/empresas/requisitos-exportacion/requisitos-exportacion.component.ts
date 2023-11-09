import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { RequisitoService } from 'src/app/services/empresa/requisitos.service';
import { NgZone } from '@angular/core';
import { Requisito } from 'src/app/interfaces/empresa/requisitos';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';


@Component({
  selector: 'app-requisitos-exportacion',
  templateUrl:'./requisitos-exportacion.component.html',
  styleUrls: ['./requisitos-exportacion.component.css']
})
export class RequisitosExportacionComponent implements OnInit{

  RequisitoEditando: Requisito = {
    id_tipo_requisito: 0, 
    tipo_requisito: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoRequisito: Requisito = {
    id_tipo_requisito: 0, 
    tipo_requisito: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listrequisito: Requisito[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _requisitoService: RequisitoService,   
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone
    ) { }

  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._requisitoService.getAllRequisito()
      .subscribe((res: any) => {
        this.listrequisito = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


onInputChange(event: any, field: string) {
  if (field === 'tipo_requisito' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}

/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Requisito', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listrequisito.forEach((Trequi, index) => {
    const row = [
      Trequi.tipo_requisito,
      Trequi.descripcion,
      Trequi.creado_por,
      Trequi.fecha_creacion,
      Trequi.modificado_por,
      Trequi.fecha_modificacion,
      this.getEstadoText(Trequi.estado) // Función para obtener el texto del estado
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
      return 'INACTIVO';;
    default:
      return 'Desconocido';
  }
}


/**************************************************************/
toggleFunction(Trequi: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (Trequi.estado === 1 ) {
    this.inactivarRequisito(Trequi, i); // Ejecuta la primera función
  } else {
    this.activarRequisito(Trequi, i); // Ejecuta la segunda función
  }
}

activarRequisito(tipo_requisito: any, i: number) {
  this._requisitoService.activarRequisito(tipo_requisito).subscribe(data =>
    this.toastr.success('El Requisito: ' + tipo_requisito.tipo_requisito + ' ha sido activado')
  );
  this.listrequisito[i].estado = 1;
}

inactivarRequisito(tipo_requisito: any, i: number) {
  this._requisitoService.inactivarRequisito(tipo_requisito).subscribe(data =>
    this.toastr.success('El Requisito: ' + tipo_requisito.tipo_requisito + ' ha sido Inactivado')
  );
  this.listrequisito[i].estado = 2;
}

  agregarRequisito() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoRequisito = {
      id_tipo_requisito: 0, 
      tipo_requisito: this.nuevoRequisito.tipo_requisito, 
      descripcion:this.nuevoRequisito.descripcion,
      creado_por: userLocal, 
      fecha_creacion: new Date(), 
      modificado_por: userLocal, 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._requisitoService.addRequisito(this.nuevoRequisito).subscribe({
    next: (data) => {
      this.insertBitacora(data);
      this.toastr.success('requisito agregado con éxito');
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



  obtenerIdTipoRequisito(tipoR: Requisito, i: any){

    this.RequisitoEditando = {
      
    id_tipo_requisito: tipoR.id_tipo_requisito, 
    tipo_requisito: tipoR.tipo_requisito, 
    descripcion: tipoR.descripcion,
    creado_por: tipoR.creado_por, 
    fecha_creacion: tipoR.fecha_creacion, 
    modificado_por: tipoR.modificado_por, 
    fecha_modificacion: tipoR.fecha_modificacion,
    estado: tipoR.estado,

    };
    this.indice = i;
  }


  editarRequisito(){
    this._requisitoService.editarRequisito(this.RequisitoEditando).subscribe(data => {
      this.toastr.success('Requisito editado con éxito');
      this.listrequisito[this.indice].tipo_requisito = this.RequisitoEditando.tipo_requisito;
      this.listrequisito[this.indice].descripcion = this.RequisitoEditando.descripcion;      
    }, error => {
      this.toastr.error('Hubo un error al editar el requisito');
    });
  }

/*************************************************************** Métodos de Bitácora ***************************************************************************/

getUser: Usuario = {
  id_usuario: 0,
  creado_por: '',
  fecha_creacion: new Date(),
  modificado_por: '',
  fecha_modificacion: new Date(),
  usuario: '',
  nombre_usuario: '',
  correo_electronico: '',
  estado_usuario: 0,
  contrasena: '',
  id_rol: 0,
  fecha_ultima_conexion: new Date(),
  primer_ingreso: new Date(),
  fecha_vencimiento: new Date(),
  intentos_fallidos: 0
};

getUsuario(){
  const userlocal = localStorage.getItem('usuario');
  if(userlocal){
    this.getUser = {
      usuario: userlocal,
      id_usuario: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      nombre_usuario: '',
      correo_electronico: '',
      estado_usuario: 0,
      contrasena: '',
      id_rol: 0,
      fecha_ultima_conexion: new Date(),
      primer_ingreso: new Date(),
      fecha_vencimiento: new Date(),
      intentos_fallidos: 0
  }
 }

 this._userService.getUsuario(this.getUser).subscribe({
   next: (data) => {
     this.getUser = data;
   },
   error: (e: HttpErrorResponse) => {
     this._errorService.msjError(e);
   }
 });
}

insertBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 11,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 11,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 11,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 11,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataRExportacion: Requisito){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 11,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL REQUISITO CON EL ID: '+ dataRExportacion.id_tipo_requisito
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


}

