import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { ErrorService } from 'src/app/services/error.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';


@Component({
  selector: 'app-register-pyme',
  templateUrl: './register-pyme.component.html',
  styleUrls: ['./register-pyme.component.css']
})
export class RegisterPymeComponent implements OnInit{

  nombre_pyme: string = '';
  rtn: string = '';
  confirmar_rtn: string = '';

  id_rolPyme: number = 0;


  newPyme: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    rtn:'',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
    id_rol: 0
  };

  constructor(
    private router: Router,
    private _pymesService: PymeService,
    private _errorService: ErrorService,
    private _toastr: ToastrService,
    private http: HttpClient) {}




  ngOnInit(): void {
    this.getRolPyme();
  }

  goToLonginPyme(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login-pyme']);
  }

  NavegarLoginPyme() {
    this.router.navigate(['/login-pyme']);
  }

  eliminarEspaciosBlanco() {
    this.nombre_pyme = this.nombre_pyme.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo usuario
    this.nombre_pyme = this.nombre_pyme.toUpperCase(); // Convierte el texto a mayúsculas
    this.rtn = this.rtn.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
  }


  getRolPyme(){
    this._pymesService.getRolPyme().subscribe({
      next: (data)=>{
        this.id_rolPyme = data.id_rol;
        console.log(data);
      },
      error:(e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  registrar(): void {
    if (this.newPyme.rtn !== this.confirmar_rtn) {
      console.error('Los RTN no coinciden');
      return;
    }
    this.newPyme = {
      id_pyme: 0,
      nombre_pyme: this.newPyme.nombre_pyme.toUpperCase(),
      rtn:this.newPyme.rtn,
      descripcion: this.newPyme.descripcion,
      creado_por: 'REGISTRO PYME',
      fecha_creacion: new Date(),
      modificado_por: 'REGISTRO PYME',
      fecha_modificacion: new Date(),
      estado: 1,
      id_rol: this.id_rolPyme
    };
    console.log(this.newPyme);
    this._pymesService.PostPyme(this.newPyme).subscribe({
      next: (data) => {
        this._toastr.success('Pyme Agregada Exitosamente');

      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });

  }
}
