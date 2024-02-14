import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { ErrorService } from 'src/app/services/error.service';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-roles',
  templateUrl:'./roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit{

  rolEditando: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };

  nuevoRol: Roles = {
    id_rol: 0, 
    rol: '', 
    descripcion: '', 
    estado_rol: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listRoles: Roles[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _rolService: RolesService,
    private _toastr: ToastrService,
    private _ngZone: NgZone,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _bitacoraService: BitacoraService,
    private _datePipe: DatePipe
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._rolService.getAllRoles()
      .subscribe({
        next: (data) =>{
        this.listRoles = data;
        this.dtTrigger.next(0);
        }
      });
    this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  // Variable de estado para alternar funciones

  toggleFunction(roles: any, i: number) {
    if (roles.estado_rol == 1) {
      this.inactivarRol(roles, i);
    } else {
      this.activarRol(roles, i);
    }
  }

convertirAMayusculas(event: any, field: string) {
  setTimeout(() => {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  });
}
  
inactivarRol(rol: any, i: number){
  this._rolService.inactivarRol(rol).subscribe(data => {
    this._toastr.success('El rol: '+ rol.rol+ ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
  this.listRoles[i].estado_rol = 2;
}
activarRol(rol: any, i: number){
  this._rolService.activarRol(rol).subscribe(data => {
    this.activarBitacora(data);
    this._toastr.success('El rol: '+ rol.rol+ ' ha sido activado')
  });
  this.listRoles[i].estado_rol = 1;
}

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre del Rol', 'Estado', 'Descripcion', 'Creado por', 'Fecha de Creacion', 'Modificado por', 'Fecha de Modificacion'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listRoles.forEach((roles, index) => {
    const row = [
      roles.rol,
      this.getEstadoText(roles.estado_rol),
      roles.descripcion,
      roles.creado_por,
      roles.fecha_creacion,
      roles.modificado_por,
      roles.fecha_modificacion,
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
      return 'DESCONOCIDO';
  }
}


/**************************************************************/

  agregarNuevoRol() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
      const fechaActual = new Date();
      const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
      this.nuevoRol = {
        id_rol: 0, 
        rol: this.nuevoRol.rol , 
        descripcion: this.nuevoRol.descripcion, 
        estado_rol: 1,
        creado_por: userLocal,
        fecha_creacion: fechaFormateada as unknown as Date, 
        modificado_por: userLocal, 
        fecha_modificacion: fechaFormateada as unknown as Date,
      };

      this._rolService.addRol(this.nuevoRol).subscribe({
        next: (data) => {
          this._toastr.success('Rol agregado con éxito');
          this.insertBitacora(data);
          this.listRoles.push(this.nuevoRol);
          
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }

  obtenerIdRol(roles: Roles, i: any){
    this.rolEditando = {
      id_rol: roles.id_rol, 
      rol: roles.rol, 
      descripcion: roles.descripcion, 
      estado_rol: roles.estado_rol,
      creado_por: roles.creado_por, 
      fecha_creacion: roles.fecha_creacion, 
      modificado_por: roles.modificado_por, 
      fecha_modificacion: roles.fecha_modificacion,
    };
    this.indice = i;
  }


  editarRol(){
    this.rolEditando.rol = this.rolEditando.rol.toUpperCase();
    this.rolEditando.descripcion = this.rolEditando.descripcion.toUpperCase();
    this.rolEditando.creado_por = this.rolEditando.creado_por.toUpperCase();
    this.rolEditando.modificado_por = this.rolEditando.modificado_por.toUpperCase();

    this._rolService.editarRol(this.rolEditando).subscribe(data => {
      this.updateBitacora(data);
      this._toastr.success('Rol editado con éxito');
      this.listRoles[this.indice].rol = this.rolEditando.rol
      this.listRoles[this.indice].descripcion = this.rolEditando.descripcion
        // Actualizar la vista
        this._ngZone.run(() => {        
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
    console.log(data);
     this.getUser = data;
   },
   error: (e: HttpErrorResponse) => {
     this._errorService.msjError(e);
   }
 });
}

insertBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL ROL: '+ dataRoles.rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'ACTUALIZA',
    descripcion: 'SE ACTUALIZA EL ROL: '+ dataRoles.rol
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataRoles: Roles){
  console.log(dataRoles);
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL ROL: '+ dataRoles.rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL ROL: '+ dataRoles.rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 3,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL ROL: '+ dataRoles.rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
 
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
