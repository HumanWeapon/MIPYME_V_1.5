import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoContacto } from 'src/app/interfaces/mantenimiento/tipoContacto';
import { TipoContactoService } from 'src/app/services/mantenimiento/tipoContacto.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';


@Component({
  selector: 'app-tipo-contacto',
  templateUrl:'./tipo-contacto.component.html',
  styleUrls: ['./tipo-contacto.component.css']
})
export class TipoContactoComponent implements OnInit{

  tipoContactoEditando: TipoContacto = {
    id_tipo_contacto: 0, 
    tipo_contacto: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoTipoContacto: TipoContacto = {
    id_tipo_contacto: 0, 
    tipo_contacto: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoC: TipoContacto[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 


  constructor(
    private _tipoCService: TipoContactoService,   
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    ) {}

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._tipoCService.getAllTipoContactos()
      .subscribe((res: any) => {
        this.listTipoC = res;
        this.dtTrigger.next(null);
      });
      this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

onInputChange(event: any, field: string) {
  if (field === 'tipo_contacto') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}

// Variable de estado para alternar funciones

toggleFunction(Tconta: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (Tconta.estado == 1 ) {
    this.inactivarTipoContacto(Tconta, i); // Ejecuta la primera función
  } else {
    this.activarTipoContacto(Tconta, i); // Ejecuta la segunda función
  }
}
  

  inactivarTipoContacto(tipoContacto: TipoContacto, i: any){
    this._tipoCService.inactivarTipoContacto(tipoContacto).subscribe(data => {
    this.toastr.success('El contacto: '+ tipoContacto.tipo_contacto + ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
    this.listTipoC[i].estado = 2; 
  }
  activarTipoContacto(tipoContacto: TipoContacto, i: any){
    this._tipoCService.activarTipoContacto(tipoContacto).subscribe(data => {
    this.toastr.success('El contacto: '+ tipoContacto.tipo_contacto + ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listTipoC[i].estado = 1;
  }




  /*******************GENERAR PDF*******************************************/

  generatePDF() {

    const {jsPDF} = require ("jspdf");
   
    const doc = new jsPDF();
    const data: any[][] =[]
    const headers = ['Nombre Tipo de Categoria', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];
  
    // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
    this.listTipoC.forEach((Tconta, index) => {
      const row = [
        Tconta.tipo_contacto,
        Tconta.descripcion,
        Tconta.creado_por,
        Tconta.fecha_creacion,
        Tconta.modificado_por,
        Tconta.fecha_modificacion,
        this.getEstadoText(Tconta.estado) // Función para obtener el texto del estado
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
  
  
  /**************************************************************/

  agregarNuevoTipoContacto() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoTipoContacto = {
      id_tipo_contacto: 0, 
      tipo_contacto: this.nuevoTipoContacto.tipo_contacto, 
      descripcion:this.nuevoTipoContacto.descripcion,
      creado_por: userLocal, 
      fecha_creacion: new Date(), 
      modificado_por: userLocal, 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._tipoCService.addTipoContacto(this.nuevoTipoContacto).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('contacto agregado con éxito');
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


  obtenerIdTipoContacto(tipoC: TipoContacto, i: any){

    this.tipoContactoEditando = {
      
    id_tipo_contacto: tipoC.id_tipo_contacto, 
    tipo_contacto: tipoC.tipo_contacto, 
    descripcion: tipoC.descripcion,
    creado_por: tipoC.creado_por, 
    fecha_creacion: tipoC.fecha_creacion, 
    modificado_por: tipoC.modificado_por, 
    fecha_modificacion: tipoC.fecha_modificacion,
    estado: tipoC.estado,

    };
    this.indice = i;
  }


  editarTipoContacto(){
    this._tipoCService.editarTipoContacto(this.tipoContactoEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('contacto editada con éxito');
      this.listTipoC[this.indice].tipo_contacto = this.tipoContactoEditando.tipo_contacto;
      this.listTipoC[this.indice].descripcion = this.tipoContactoEditando.descripcion;

        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
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

insertBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL TIPO DE CONTACTO CON EL ID: '+ dataTipContacto.id_tipo_contacto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL TIPO DE CONTACTO CON EL ID: '+ dataTipContacto.id_tipo_contacto
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL TIPO DE CONTACTO CON EL ID: '+ dataTipContacto.id_tipo_contacto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL TIPO DE CONTACTO CON EL ID: '+ dataTipContacto.id_tipo_contacto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataTipContacto: TipoContacto){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 12,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL TIPO DE CONTACTO CON EL ID: '+ dataTipContacto.id_tipo_contacto
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


}














/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */