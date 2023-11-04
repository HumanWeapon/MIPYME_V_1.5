import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
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
    this._userService.inactivarUsuario(usuario).subscribe(data =>{

    }
      //this.toastr.success('El usuario: ' + usuario.usuario + ' ha sido inactivado')
    );
    this.usuariosAllRoles[i].estado_usuario = 2;
  }
  activarUsuario(usuario: any, i: any) {
    this._userService.activarUsuario(usuario).subscribe(data =>{}
      //this.toastr.success('El usuario: ' + usuario.usuario + ' ha sido activado')
    );
    this.usuariosAllRoles[i].estado_usuario = 1;
  }

  agregarNuevoUsuario() {
   
    
  }
  
  editarUsuario(rol: any) {
    
    
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
