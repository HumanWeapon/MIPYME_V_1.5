import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  
  usuarioEditando: Usuario = {
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
    intentos_fallidos: 0,
  };



  nuevoUsuario: Usuario = {
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
    intentos_fallidos: 0,
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listUsuarios: Usuario[] = [];
  data: any; 
  dtTrigger: Subject<any> = new Subject<any>();

  usuariosAllRoles: any[] = []
  
  
  constructor(
    private _userService: UsuariosService,
    private _router: Router,
    private ngZone: NgZone,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllRoles();
    this.getAllUsuarios();
  }

  getAllRoles(){
    

  }
  getAllUsuarios(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
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

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'correo_electronico' || field === 'usuario') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    } else if (field === 'nombre_usuario') {
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  
  inactivarUsuario(usuario: any, i: any) {
    this._userService.inactivarUsuario(usuario).subscribe(data =>
      this.toastr.success('El usuario: ' + usuario.usuario + ' ha sido inactivado')
    );
    this.usuariosAllRoles[i].estado_usuario = 2;
  }
  activarUsuario(usuario: any, i: any) {
    this._userService.activarUsuario(usuario).subscribe(data =>
      this.toastr.success('El usuario: ' + usuario.usuario + ' ha sido activado')
    );
    this.usuariosAllRoles[i].estado_usuario = 1;
  }

  agregarNuevoUsuario() {
    this.nuevoUsuario = {
      id_usuario: 0,
      creado_por: 'SYSTEM',
      fecha_creacion: new Date(),
      modificado_por: 'SYSTEM',
      fecha_modificacion: new Date(),
      usuario: this.nuevoUsuario.usuario,
      nombre_usuario: this.nuevoUsuario.nombre_usuario,
      correo_electronico: this.nuevoUsuario.correo_electronico,
      estado_usuario: 1,
      contrasena: this.nuevoUsuario.usuario,
      id_rol: this.nuevoUsuario.id_rol,
      fecha_ultima_conexion: new Date(),
      primer_ingreso: new Date(),
      fecha_vencimiento: this.nuevoUsuario.fecha_vencimiento,
      intentos_fallidos: 0,
    };

    this._userService.addUsuario(this.nuevoUsuario).subscribe(data => {
      this.toastr.success('Usuario agregado con éxito');


        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    });
  }
  



  obtenerIdUsuario(usuario: Usuario, i: any) {
    this.usuarioEditando = {
      id_usuario: usuario.id_usuario,
      creado_por: usuario.creado_por,
      fecha_creacion: usuario.fecha_creacion,
      modificado_por: usuario.modificado_por,
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
    this.indice = i;
    
  }

  
  editarUsuario(rol: any) {
    this._userService.editarUsuario(this.usuarioEditando).subscribe(data => {
      this.toastr.success('Usuario editado con éxito');
      if(this.usuariosAllRoles == null){
        //no se puede editar el usuario
      }else{
      this.usuariosAllRoles[this.indice].usuario = this.usuarioEditando.usuario;
      this.usuariosAllRoles[this.indice].nombre_usuario = this.usuarioEditando.nombre_usuario;
      this.usuariosAllRoles[this.indice].correo_electronico = this.usuarioEditando.correo_electronico;
      this.usuariosAllRoles[this.indice].roles.rol = rol.rol;
      this.usuariosAllRoles[this.indice].fecha_vencimiento = this.usuarioEditando.fecha_vencimiento; 
      }

        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });

    });
    
    
  }

  insertBitacora(){
    const userloca = localStorage.getItem('usuario');
    this._userService.getOneUsuario(userloca).subscribe(data=>{
      console.log(data);
    })

    /*const bitacora = {
      fecha: new Date(),
      id_usuario: this.usu,
      id_objeto: string,
      accion: string,
      descripcion: string
    }
    this._bitacoraService.insertBitacora().subscribe(data =>{

    })*/
  }
}
