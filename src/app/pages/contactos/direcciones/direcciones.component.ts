import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ContactoDirecciones } from 'src/app/interfaces/contacto/contactoDirecciones';
import {DireccionesService} from 'src/app/services/contacto/direcciones.service';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { TipoDireccion } from 'src/app/interfaces/mantenimiento/tipoDireccion';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';



@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent {
  direccionEditando: ContactoDirecciones = {
    id_direccion: 0, 
    id_tipo_direccion: 0,
    direccion:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };

  nuevaDireccion: ContactoDirecciones = {
    id_direccion: 0, 
    id_tipo_direccion: 0,
    direccion:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listDirecciones: ContactoDirecciones[] = [];
  data: any;
  listContacto: Contacto[] = [];
  listTipoC: TipoDireccion[] = [];

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  con: Contacto[] = [];
  Allcontacto: any[] = [];
  tip: TipoDireccion[] = [];
  Alltipocontacto: any[] = []

  constructor(
    private _objService: DireccionesService, 
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private ngZone: NgZone,
    private _contacto: ContactoService,
    private _Tipodireccion: TipoDireccionService
    ) {}

  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._objService.getAllDireccion()
      .subscribe((res: any) => {
        this.listDirecciones= res;
        console.log(res)
        this.dtTrigger.next(null);
      });

      this._Tipodireccion.getAllTipoDirecciones().subscribe(data => {
        this.listTipoC = data
        console.log(this.listTipoC)

      
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    if (field === 'direccion' || field === 'descripcion') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }
  

  agregarNuevaDireccion() {

    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevaDireccion = {
        id_direccion: 0, 
        id_tipo_direccion: this.nuevaDireccion.id_tipo_direccion, 
        direccion: this.nuevaDireccion.direccion, 
        descripcion:this.nuevaDireccion.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date()

      };


    
      this._objService.addDireccion(this.nuevaDireccion).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Direccion agregado con éxito')
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
  


  obtenerIdDireccion(direccion: ContactoDirecciones, i: any){
    this.direccionEditando = {
    id_direccion: direccion.id_direccion,
    id_tipo_direccion: this.nuevaDireccion.id_tipo_direccion, 
    direccion: direccion.direccion, 
    descripcion: direccion.descripcion,  
    creado_por: direccion.creado_por, 
    fecha_creacion: direccion.fecha_creacion, 
    modificado_por: direccion.modificado_por, 
    fecha_modificacion: direccion.fecha_modificacion,
    estado: direccion.estado

    };
    this.indice = i;
  
  }


  editarDireccion(con: any) {
    
    this._objService.editarDireccion(this.direccionEditando).subscribe(data => {
      this.toastr.success('Direccion editado con éxito');
      if(this.Alltipocontacto == null){
        //no se puede editar el usuario
      }else{
      this.Alltipocontacto[this.indice].direccion = this.direccionEditando.direccion;
      this.Alltipocontacto[this.indice].descripcion = this.direccionEditando.descripcion;
      this.Alltipocontacto[this.indice].contacto.con = con.con;
       // Recargar la página
       location.reload();
      }

    });
  }

  /**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(obj: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (obj.estado === 1 ) {
    this.inactivarDireccion(obj, i); // Ejecuta la primera función
  } else {
    this.activarDireccion(obj, i); // Ejecuta la segunda función
  }
}
  
inactivarDireccion(direccion: ContactoDirecciones, i: any){
  this._objService.inactivarDireccion(direccion).subscribe(data => 
    this.toastr.success('La Direccion: '+ direccion.direccion+ ' ha sido inactivada')
    );
  this.listDirecciones[i].estado = 2;
}
activarDireccion(direccion: ContactoDirecciones, i: any){
  this._objService.activarDireccion(direccion).subscribe(data => 
  this.toastr.success('La Direccion: '+ direccion.direccion+ ' ha sido activada')
  );
  this.listDirecciones[i].estado = 1;
}

/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Direccion', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listDirecciones.forEach((obj, index) => {
    const row = [
      obj.direccion,
      obj.descripcion,
      obj.creado_por,
      obj.fecha_creacion,
      obj.modificado_por,
      obj.fecha_modificacion,
      this.getEstadoText(obj.estado) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  doc.autoTable({
    head: [headers],
    body: data,
  });

  doc.output('dataurlnewwindow', null, 'Productos.pdf');
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

insertBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 6,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA LA DIRECCION CON EL ID: '+ dataDireccion.id_direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 6,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA LA DIRECCION CON EL ID: '+ dataDireccion.id_direccion
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 6,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA LA DIRECCION CON EL ID: '+ dataDireccion.id_direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 6,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA LA DIRECCION CON EL ID: '+ dataDireccion.id_direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 6,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA LA DIRECCION CON EL ID: '+ dataDireccion.id_direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}



