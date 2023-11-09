import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Empresa  } from 'src/app/interfaces/empresa/empresas';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { ErrorService } from 'src/app/services/error.service';
import { NgZone } from '@angular/core';
//import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';

@Component({
  selector: 'app-empresas-productos',
  templateUrl: './empresas-productos.component.html',
  styleUrls: ['./empresas-productos.component.css']
})
export class EmpresasProductosComponent {

 
}
