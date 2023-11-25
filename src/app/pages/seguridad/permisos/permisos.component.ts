import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Permisos } from 'src/app/interfaces/seguridad/permisos';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit, OnDestroy {
  roles: Roles[] = [];
  objetos: Objetos[] = [];

  permisoeditando: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  nuevoPermiso: Permisos = {
    id_permisos: 0,
    id_rol: 0,
    id_objeto: 0,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar: false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };

  deletePermiso: Permisos = {
    id_permisos: 0, 
    id_rol: 0, 
    id_objeto: 0,
    permiso_insercion: false,
    permiso_eliminacion: false,
    permiso_actualizacion: false,
    permiso_consultar:false,
    estado_permiso: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
  };
  
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPermisos: Permisos[] = [];
  data: any;
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private _permService: PermisosService, 
    private _objectService: ObjetosService,
    private _rolesService: RolesService, 
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.getAllObjetos();
    this.getAllRoles();

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    };

    this._permService.getAllPermisos().subscribe((res: any) => {
      this.listPermisos = res;
      this.dtTrigger.next(null);
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getAllRoles() {
    this._rolesService.getAllRoles().subscribe((data: Roles[]) => {
      this.roles = data;
    });
  }

  getAllObjetos() {
    this._objectService.getAllObjetos().subscribe((data: Objetos[]) => {
      this.objetos = data;
    });
  }

// Variable de estado para alternar funciones

toggleFunction(perm: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (perm.estado_permiso === 1 ) {
    this.inactivarPermiso(perm, i); // Ejecuta la primera función
  } else {
    this.activarPermiso(perm, i); // Ejecuta la segunda función
  }
}

  inactivarPermiso(permisos: Permisos, i: any){
    this._permService.inactivarPermiso(permisos).subscribe(data => 
    this.toastr.success('El permiso: ' + permisos.id_permisos+ ' ha sido inactivado')
    );
    this.listPermisos[i].estado_permiso = 2;
  }
  activarPermiso(permisos: Permisos, i: any){
    this._permService.activarPermiso(permisos).subscribe(data => 
    this.toastr.success('El permiso:' + permisos.id_permisos+ ' ha sido activado')
    );
    this.listPermisos[i].estado_permiso = 1;
  }

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['ID Permiso','ID Rol','ID Objeto', 'Insercion', 'Eliminacion', 'Consultar', 'Actualizacion', 'Estado', 'Creador', 'Fecha Creacion', 'Fecha Modificacion'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listPermisos.forEach((perm, index) => {
    const row = [
      perm.id_permisos,
      this.getRolNombre(perm.id_rol),                     
      this.getObjetoNombre(perm.id_objeto), 
      perm.permiso_insercion,
      perm.permiso_eliminacion,
      perm.permiso_consultar,
      perm.permiso_actualizacion,
      this.getEstadoText(perm.estado_permiso),
      perm.creado_por,
      perm.fecha_creacion,
      perm.fecha_modificacion
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


  agregarNuevoPermiso() {
    const LocalUser = localStorage.getItem('usuario');
    if (LocalUser){
      this.nuevoPermiso = {
        id_permisos: 0,
        id_rol: 0,
        id_objeto: 0,
        permiso_insercion: false,
        permiso_eliminacion: false,
        permiso_actualizacion: false,
        permiso_consultar: false,
        estado_permiso: 0,
        creado_por: LocalUser,
        fecha_creacion: new Date(),
        modificado_por: LocalUser,
        fecha_modificacion: new Date(),
      }
      this._permService.addPermiso(this.nuevoPermiso).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Permiso agregado exitosamente', 'Éxito')
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }

  obtenerIdPermiso(permisos: Permisos, i: any) {
    this.permisoeditando = {
      id_permisos: permisos.id_permisos,
      id_rol: permisos.id_rol,
      id_objeto: permisos.id_objeto,
      permiso_insercion: permisos.permiso_insercion,
      permiso_eliminacion: permisos.permiso_eliminacion,
      permiso_actualizacion: permisos.permiso_actualizacion,
      permiso_consultar: permisos.permiso_consultar,
      estado_permiso: permisos.estado_permiso,
      creado_por: permisos.creado_por,
      fecha_creacion: permisos.fecha_creacion,
      modificado_por: permisos.modificado_por,
      fecha_modificacion: permisos.fecha_modificacion,
    };
    this.indice = i;
  }

  editarPermiso() {
    this._permService.editarPermiso(this.permisoeditando).subscribe(() => {
      this.toastr.success('Permiso editado con éxito');
      this.listPermisos[this.indice] = { ...this.permisoeditando };
      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
    });
  }
  getRolNombre(idRol: number): string {
    const rol = this.roles.find(rol => rol.id_rol === idRol);
    return rol ? rol.rol : 'Rol no encontrado';
  }
  getObjetoNombre(idObjeto: number): string {
    const objeto = this.objetos.find(objeto => objeto.id_objeto === idObjeto);
    return objeto ? objeto.objeto : 'Objeto no encontrado';
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

insertBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 27,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 27,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 27,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 27,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataPermisos: Permisos){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 27,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL PERMISO CON EL ID: '+ dataPermisos.id_permisos
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}


