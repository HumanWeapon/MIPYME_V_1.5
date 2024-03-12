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
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    fecha_ultima_conexion: new Date(),
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
    //this.newPyme.nombre_pyme = this.newPyme.nombre_pyme.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo pyme
    this.newPyme.nombre_pyme = this.newPyme.nombre_pyme.toUpperCase(); // Convierte el texto a mayúsculas
    this.newPyme.rtn = this.rtn.replace(/\s/g, ''); // Elimina espacios en blanco para el cambo contraseña
  }

  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'nombre_pyme') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9]/g, ''); // Solo permite letras y números
      } else if (field === 'rtn') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9@.]/g, ''); // Solo permite letras, números, @ y .
      } else if (field === 'confirmar_rtn') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9@.]/g, ''); // Solo permite letras, números, @ y .
      }
      event.target.value = inputValue;
    });
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
    // Verifica si alguno de los campos está vacío
    if (!this.newPyme.nombre_pyme || !this.newPyme.rtn || !this.confirmar_rtn) {
      this._toastr.error('Por favor, complete todos los campos');
      return; 
    }
  
    // Verifica si los RTN exceden los 14 dígitos
    if (this.newPyme.rtn.length !== 14 || this.confirmar_rtn.length !== 14) {
      this._toastr.error('El RTN debe tener exactamente 14 dígitos');
      return; 
    }
  
    // Verifica si los RTN coinciden
    if (this.newPyme.rtn !== this.confirmar_rtn) {
      this._toastr.error('RTN no Coinciden');
      return; 
    }
  
    // Si todos los campos están llenos, la longitud del RTN es válida y los RTN coinciden, procede con el registro
    this.newPyme = {
      id_pyme: 0,
      nombre_pyme: this.newPyme.nombre_pyme.toUpperCase(),
      rtn:this.newPyme.rtn,
      creado_por: 'REGISTRO PYME',
      fecha_creacion: new Date(),
      modificado_por: 'REGISTRO PYME',
      fecha_modificacion: new Date(),
      fecha_ultima_conexion: new Date(),
      estado: 1,
      id_rol: this.id_rolPyme
    };
    console.log(this.newPyme);
    this._pymesService.PostPyme(this.newPyme).subscribe({
      next: (data) => {
        this._toastr.success('Pyme Agregada Exitosamente');
        // Después de mostrar el mensaje de éxito, redirige al usuario a la página de inicio de sesión
        this.router.navigate(['/login-pyme']);
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
}  