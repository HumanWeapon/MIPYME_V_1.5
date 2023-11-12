import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoDireccion } from 'src/app/interfaces/mantenimiento/tipoDireccion';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';



@Component({
  selector: 'app-tipo-direccion',
  templateUrl:'./tipo-direccion.component.html',
  styleUrls: ['./tipo-direccion.component.css']
})
export class TipoDireccionComponent implements OnInit{

  tipoDireccionEditando: TipoDireccion = {
    id_tipo_direccion: 0, 
    tipo_direccion: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoTipoDireccion: TipoDireccion = {
    id_tipo_direccion: 0, 
    tipo_direccion: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoD: TipoDireccion[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _tipoDService: TipoDireccionService, 
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    ) {}

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._tipoDService.getAllTipoDirecciones()
      .subscribe((res: any) => {
        this.listTipoD = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


onInputChange(event: any, field: string) {
  if (field === 'tipo_direccion' ) {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}

/**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(Tdirec: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (Tdirec.estado === 1 ) {
    this.inactivarTipoDireccion(Tdirec, i); // Ejecuta la primera función
  } else {
    this.activarTipoDireccion(Tdirec, i); // Ejecuta la segunda función
  }
}

  inactivarTipoDireccion(tipoDireccion: TipoDireccion, i: any){
    this._tipoDService.inactivarTipoDireccion(tipoDireccion).subscribe(data => 
    this.toastr.success('La Dirección: '+ tipoDireccion.tipo_direccion + ' ha sido inactivado')
    );
    this.listTipoD[i].estado = 2;
  }
  activarTipoDireccion(tipoDireccion: TipoDireccion, i: any){
    this._tipoDService.activarTipoDireccion(tipoDireccion).subscribe(data => 
    this.toastr.success('La Dirección: '+ tipoDireccion.tipo_direccion + ' ha sido activado')
    );
    this.listTipoD[i].estado = 1;
  }

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Tipo de Direccion', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listTipoD.forEach((Tdirec, index) => {
    const row = [
      Tdirec.tipo_direccion,
      Tdirec.descripcion,
      Tdirec.creado_por,
      Tdirec.fecha_creacion,
      Tdirec.modificado_por,
      Tdirec.fecha_modificacion,
      this.getEstadoText(Tdirec.estado) // Función para obtener el texto del estado
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


  agregarNuevoTipoDireccion() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoTipoDireccion = {
      id_tipo_direccion: 0, 
      tipo_direccion: this.nuevoTipoDireccion.tipo_direccion, 
      descripcion:this.nuevoTipoDireccion.descripcion,
      creado_por: userLocal, 
      fecha_creacion: new Date(), 
      modificado_por: userLocal,
      fecha_modificacion: new Date(),
      estado: 1,

    };

    this._tipoDService.addTipoDireccion(this.nuevoTipoDireccion).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Dirección agregado con éxito');
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

  obtenerIdTipoDireccion(tipoD: TipoDireccion, i: any){

    this.tipoDireccionEditando = {
      
    id_tipo_direccion: tipoD.id_tipo_direccion, 
    tipo_direccion: tipoD.tipo_direccion, 
    descripcion: tipoD.descripcion,
    creado_por: tipoD.creado_por, 
    fecha_creacion: tipoD.fecha_creacion, 
    modificado_por: tipoD.modificado_por, 
    fecha_modificacion: tipoD.fecha_modificacion,
    estado: tipoD.estado,

    };
    this.indice = i;
  }


  editarTipoDireccion(){
    this._tipoDService.editarTipoDireccion(this.tipoDireccionEditando).subscribe(data => {
      this.toastr.success('Direccion editada con éxito');
      this.listTipoD[this.indice].tipo_direccion = this.tipoDireccionEditando.tipo_direccion;
      this.listTipoD[this.indice].descripcion = this.tipoDireccionEditando.descripcion;

      
        // Recargar la página
        location.reload();
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
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

  insertBitacora(dataTipDirec: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 8,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA EL TIPO DE DIRECCION CON EL ID: '+ dataTipDirec.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataTipDirec: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 8,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA EL TIPO DE DIRECCION CON EL ID: '+ dataTipDirec.id_tipo_direccion
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataTipDirec: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 8,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL TIPO DE DIRECCION CON EL ID: '+ dataTipDirec.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataTipDirec: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 8,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL TIPO DE DIRECCION CON EL ID: '+ dataTipDirec.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataTipDirec: TipoDireccion){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 8,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL TIPO DE DIRECCION CON EL ID: '+ dataTipDirec.id_tipo_direccion
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */