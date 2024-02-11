import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { RolesService } from 'src/app/services/seguridad/roles.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  

  listUsuarios: Usuario[] = [];
  listRol: Roles[] = [];
  usuariosAllRoles: any[] = []
  indiceUser: any;
  indiceRol: any;
  objectBitacora: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  newUser: Usuario = {
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
  }

  editUser: Usuario = {
    
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
  }
  constructor(
    private _userService: UsuariosService,
    private _ngZone: NgZone,
    private _toastr: ToastrService,
    private _rolService: RolesService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.getAllRoles();
    this.getUsuario();
    this.getAllUsuarios();
  }

  getAllRoles(){
    this._rolService.getAllRoles().subscribe(data => {
      this.listRol = data;
    });

  }
  getAllUsuarios(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    },
    this._userService.usuariosAllRoles().subscribe({
      next: (data) =>{
        this.usuariosAllRoles = data;
        this.listUsuarios = data;
        this.dtTrigger.next(0);
      }
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  eliminarEspaciosBlanco(event: any, field: string) {

    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
      this.editUser.usuario = this.editUser.usuario.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo usuario
      this.editUser.usuario = this.editUser.usuario.toUpperCase(); // Convierte el texto a mayúsculas
      this.editUser.contrasena = this.editUser.contrasena.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
    });
  }

  convertirAMayusculas(event: any, field: string) {
    const inputValue = event.target.value;
    event.target.value = inputValue.toUpperCase();
  }
  
  // Variable de estado para alternar funciones

toggleFunction(user: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (user.estado_usuario === 1 ) {
    this.inactivarUsuario(user, i); // Ejecuta la primera función
  } else {
    this.activarUsuario(user, i); // Ejecuta la segunda función
  }
}


  inactivarUsuario(usuario: any, i: any) {
    this._userService.inactivarUsuario(usuario).subscribe({
      next: (data) => {
        this.inactivarBitacora(data);
        this._toastr.success('El usuario: ' + usuario.nombre_usuario + ' ha sido Inactivado')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.usuariosAllRoles[i].estado_usuario = 2;
    
  }
  activarUsuario(usuario: any, i: any) {
    this._userService.activarUsuario(usuario).subscribe({
      next: (data) => {
        this.activarBitacora(data);
        this._toastr.success('El usuario: ' + usuario.nombre_usuario + ' ha sido Activado')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.usuariosAllRoles[i].estado_usuario = 1;
  }

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['ID Usuario','Nombre Usuario', 'Correo Electronico','Rol','Creador', 'Ultima Conexion', 'Fecha de Vencimiento', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.usuariosAllRoles.forEach((user, index) => {
    const row = [
       user.usuario, 
       user.nombre_usuario,
       user.correo_electronico,
       user.roles.rol,
       user.creado_por,
       user.fecha_ultima_conexion,
       user.fecha_vencimiento,
      this.getEstadoText(user.estado_usuario) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: data,
  });

  doc.output('dataurlnewwindow', null, 'Pymes.pdf');
}

getEstadoText(estado_usuario: number): string {
  switch (estado_usuario) {
    case 1:
      return 'ACTIVO';
    case 2:
      return 'INACTIVO';
      case 3:
        return 'BLOQUEADO';
      case 4:
        return 'VENCIDO';
    default:
      return 'Desconocido';
  }
}


/**************************************************************/


  agregarNuevoUsuario() {
    const LocalUser = localStorage.getItem('usuario');
    if (LocalUser){

      this.newUser = {
        id_usuario: 0,
        creado_por: LocalUser,
        fecha_creacion: new Date(),
        modificado_por: LocalUser,
        fecha_modificacion: new Date(),
        usuario: this.newUser.usuario,
        nombre_usuario: this.newUser.nombre_usuario,
        correo_electronico: this.newUser.correo_electronico,
        estado_usuario: 1,
        contrasena: this.newUser.usuario,
        id_rol: this.newUser.id_rol,
        fecha_ultima_conexion: new Date(),
        primer_ingreso: new Date(),
        fecha_vencimiento: this.newUser.fecha_vencimiento,
        intentos_fallidos: 0,
      };
  
      this._userService.addUsuario(this.newUser).subscribe({
        next: (data) => {
          this.insertBitacora(data);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }

  obtenerIdUsuario(usuario: Usuario, i: any) {
    const localuser = localStorage.getItem('usuario');
    if(localuser){
      this.editUser = {
        id_usuario: usuario.id_usuario,
        creado_por: usuario.creado_por,
        fecha_creacion: usuario.fecha_creacion,
        modificado_por: localuser,
        fecha_modificacion: usuario.fecha_modificacion,
        usuario: usuario.usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo_electronico: usuario.correo_electronico,
        estado_usuario: usuario.estado_usuario,
        contrasena: usuario.contrasena,
        id_rol: usuario.id_rol,
        fecha_ultima_conexion: usuario.fecha_ultima_conexion,
        primer_ingreso: usuario.primer_ingreso,
        fecha_vencimiento: usuario.fecha_vencimiento,
        intentos_fallidos: usuario.intentos_fallidos,
      };
    }
    this.indiceUser = i;
  }

  
  editarUsuario(Id_Rol_Selected: any) {
    // Busca el objeto de rol correspondiente en listRol
    const modificador = localStorage.getItem('usuario')
    const rolSeleccionado = this.listRol.find(rol => rol.id_rol == Id_Rol_Selected);
    if (!rolSeleccionado) {
      // Maneja el caso cuando no se encuentra el rol seleccionado
      console.error('Rol no encontrado, contacta al administrador del sistema');
      return;
    }
  
    this._userService.editarUsuario(this.editUser).subscribe(data => {
      this._toastr.success('Usuario editado con éxito');
      if (this.usuariosAllRoles == null) {
        // No se puede editar el usuario
      } else {
        this.usuariosAllRoles[this.indiceUser].usuario = this.editUser.usuario;
        this.usuariosAllRoles[this.indiceUser].nombre_usuario = this.editUser.nombre_usuario;
        this.usuariosAllRoles[this.indiceUser].correo_electronico = this.editUser.correo_electronico;
        this.usuariosAllRoles[this.indiceUser].roles = rolSeleccionado
        this.usuariosAllRoles[this.indiceUser].fecha_vencimiento = this.editUser.fecha_vencimiento;
        this.usuariosAllRoles[this.indiceUser].modificado_por = modificador;
      }
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

  insertBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA EL REGISTRO CON EL ID: '+ dataUser.id_usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA EL REGISTRO CON EL ID: '+ dataUser.id_usuario
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL USUARIO CON EL ID: '+ dataUser.id_usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL USUARIO CON EL ID: '+ dataUser.id_usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataUser: Usuario){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA EL REGISTRO CON EL ID: '+ dataUser.id_usuario
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/
    
}
