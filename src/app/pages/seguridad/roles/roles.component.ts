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
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _bitacoraService: BitacoraService
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._rolService.getAllRoles()
      .subscribe((res: any) => {
        this.listRoles = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'rol') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    }
  }

  
  // Variable de estado para alternar funciones

toggleFunction(roles: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (roles.estado_rol === 1 ) {
    this.inactivarRol(roles, i); // Ejecuta la primera función
  } else {
    this.activarRol(roles, i); // Ejecuta la segunda función
  }
}
  inactivarRol(roles: Roles, i: any){
    this._rolService.inactivarRol(roles).subscribe(data => 
    this.toastr.success('El rol: '+ roles.rol+ ' ha sido inactivado')
    );
    this.listRoles[i].estado_rol = 2;
  }
  activarRol(roles: Roles, i: any){
    this._rolService.activarRol(roles).subscribe(data => 
    this.toastr.success('El rol: '+ roles.rol+ ' ha sido activado')
    );
    this.listRoles[i].estado_rol = 1;
  }

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['ID Rol', 'Nombre del Rol', 'Estado', 'Descripcion', 'Fecha de Creacion', 'Fecha de Modificacion'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listRoles.forEach((roles, index) => {
    const row = [
      roles.id_rol,
      roles.rol,
      this.getEstadoText(roles.estado_rol),
      roles.descripcion,
      roles.fecha_creacion,
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
      return 'Desconocido';
  }
}


/**************************************************************/

  agregarNuevoRol() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoRol = {
      id_rol: 0, 
      rol: this.nuevoRol.rol , 
      descripcion: '', 
      estado_rol: 1,
      creado_por: userLocal,
      fecha_creacion: new Date(), 
      modificado_por: userLocal, 
      fecha_modificacion: new Date(),
    };

    this._rolService.addRol(this.nuevoRol).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Rol agregado con éxito');
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

  obtenerIdRol(roles: Roles, i: any){
    this.rolEditando = {
      id_rol: roles.id_rol, 
      rol: roles.rol , 
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
    this._rolService.editarRol(this.rolEditando).subscribe(data => {
      this.toastr.success('Rol editado con éxito');
      this.listRoles[this.indice].rol = this.rolEditando.rol;

        // Recargar la página
        location.reload();
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

insertBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 26,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL ROL CON EL ID: '+ dataRoles.id_rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 26,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL ROL CON EL ID: '+ dataRoles.id_rol
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 26,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL ROL CON EL ID: '+ dataRoles.id_rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 26,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL ROL CON EL ID: '+ dataRoles.id_rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataRoles: Roles){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 26,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL ROL CON EL ID: '+ dataRoles.id_rol
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
