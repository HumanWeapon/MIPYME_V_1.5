import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Ciudades } from 'src/app/interfaces/mantenimiento/ciudades';
import { CiudadesService } from 'src/app/services/mantenimiento/ciudades.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';



@Component({
  selector: 'app-ciudades',
  templateUrl:'./ciudades.component.html',
  styleUrls: ['./ciudades.component.css']
})
export class CiudadesComponent implements OnInit{

  ciudadEditando: Ciudades = {
    id_ciudad: 0, 
    ciudad: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
    

  };

  nuevoCiudad: Ciudades = {
    id_ciudad: 0, 
    ciudad: '', 
    descripcion:'',
    creado_por: 'SYSTEM', 
    fecha_creacion: new Date(), 
    modificado_por: 'SYSTEM', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listCiudades: Ciudades[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _ciudadService: CiudadesService, 
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone
    ) {}

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._ciudadService.getAllCiudades()
      .subscribe((res: any) => {
        this.listCiudades = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

onInputChange(event: any, field: string) {
  if (field === 'ciudad' || field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}

// Variable de estado para alternar funciones

toggleFunction(ciu: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (ciu.estado === 1 ) {
    this.inactivarCiudad(ciu, i); // Ejecuta la primera función
  } else {
    this.activarCiudad(ciu, i); // Ejecuta la segunda función
  }
}

  inactivarCiudad(ciudades: Ciudades, i: any){
    this._ciudadService.inactivarCiudad(ciudades).subscribe(data => 
    this.toastr.success('La Ciudad: '+ ciudades.ciudad + ' ha sido inactivado')
    );
    this.listCiudades[i].estado = 2;
  }
  activarCiudad(ciudades: Ciudades, i: any){
    this._ciudadService.activarCiudad(ciudades).subscribe(data => 
    this.toastr.success('La ciudad: '+ ciudades.ciudad + ' ha sido activado')
    );
    this.listCiudades[i].estado = 1;
  }
  
  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Ciudad', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listCiudades.forEach((ciu, index) => {
    const row = [
      ciu.ciudad,
      ciu.descripcion,
      ciu.creado_por,
      ciu.fecha_creacion,
      ciu.modificado_por,
      ciu.fecha_modificacion,
      this.getEstadoText(ciu.estado) // Función para obtener el texto del estado
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


  agregarNuevoCiudad() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoCiudad = {
      id_ciudad: 0, 
      ciudad: this.nuevoCiudad.ciudad, 
      descripcion:this.nuevoCiudad.descripcion,
      creado_por: userLocal, 
      fecha_creacion: new Date(), 
      modificado_por: userLocal, 
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._ciudadService.addCiudad(this.nuevoCiudad).subscribe({
      next:(data) => {
      this.insertBitacora(data);
      this.toastr.success('Ciudad agregado con éxito');
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


  obtenerIdCiudad(ciudades: Ciudades, i: any){
    this.ciudadEditando = {
    id_ciudad: ciudades.id_ciudad, 
    ciudad: ciudades.ciudad, 
    descripcion: ciudades.descripcion,
    creado_por: ciudades.creado_por, 
    fecha_creacion: ciudades.fecha_creacion, 
    modificado_por: ciudades.modificado_por, 
    fecha_modificacion: ciudades.fecha_modificacion,
    estado: ciudades.estado,

    };
    this.indice = i;
  }


  editarCiudad(){
    this._ciudadService.editarCiudad(this.ciudadEditando).subscribe(data => {
      this.toastr.success('Ciudad editada con éxito');
      this.listCiudades[this.indice].ciudad = this.ciudadEditando.ciudad;
      this.listCiudades[this.indice].descripcion = this.ciudadEditando.descripcion;

      
        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
    });
  }

 /***************************************************************
 * Métodos de Bitácora
 *****************************************************************/

// Usuario por defecto
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

// Obtener información del usuario
getUsuario() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal) {
    this.getUser = {
      ...this.getUser,
      usuario: userLocal
    };
  }

  this._userService.getUsuario(this.getUser).subscribe({
    next: (data: Usuario) => {
      this.getUser = data;
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}

// Insertar una entrada en la bitácora para una ciudad
insertBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 2,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA LA CIUDAD CON EL ID: ' + dataCiudad.id_ciudad
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

// Actualizar la bitácora para una ciudad
updateBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 2,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA LA CIUDAD CON EL ID: ' + dataCiudad.id_ciudad
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

// Activar la bitácora para una ciudad
activarBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 2,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA LA CIUDAD CON EL ID: ' + dataCiudad.id_ciudad
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

// Inactivar la bitácora para una ciudad
inactivarBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 2,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA LA CIUDAD CON EL ID: ' + dataCiudad.id_ciudad
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

// Eliminar la bitácora para una ciudad
deleteBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 2,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA LA CIUDAD CON EL ID: ' + dataCiudad.id_ciudad
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/



}

























/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
