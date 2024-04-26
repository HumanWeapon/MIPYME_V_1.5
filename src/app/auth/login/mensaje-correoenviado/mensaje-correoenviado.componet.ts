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

     ) { }
  
  ngOnInit(): void {

  }

  cerrarModal() {
    this.router.navigate(['/login']);
  }  
 
}




