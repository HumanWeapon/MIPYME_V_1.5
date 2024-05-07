import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { ErrorService } from 'src/app/services/error.service';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-mensaje-correoenviado',
  templateUrl: './mensaje-correoenviado.component.html',
  styleUrls: ['./mensaje-correoenviado.component.css']
})
export class MensajeCorreoEnviadoComponent implements OnInit {
  
  constructor(private router: Router, 
     private userService: UsuariosService
     ) { }

     usuario: Usuario = {
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
      fecha_vencimiento: new Date(),
      intentos_fallidos: 0
    };

  
  ngOnInit(): void {
      this.getUsuario()
  }

  getUsuario(){
    const userLocal = localStorage.getItem('usuario');
    if(userLocal == null){

    }else{
      this.usuario.usuario = userLocal;
      this.userService.getUsuario(this.usuario).subscribe(data => {
        this.usuario = data;
      });
    }
  }
  

  cerrarModal() {
    this.router.navigate(['/login']);
  }  
 
}




