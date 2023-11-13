import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Objetos } from 'src/app/interfaces/seguridad/objetos';
import { ObjetosService } from 'src/app/services/seguridad/objetos.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';


@Component({
  selector: 'app-objetos',
  templateUrl:'./objetos.component.html',
  styleUrls: ['./objetos.component.css']
})
export class ObjetosComponent implements OnInit{

  objetoEditando: Objetos = {
    id_objeto: 0, 
    objeto: '', 
    descripcion:'', 
    tipo_objeto: '', 
    estado_objeto: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };

  nuevoObjeto: Objetos = {
    id_objeto: 0, 
    objeto: '', 
    descripcion:'', 
    tipo_objeto: '', 
    estado_objeto: 0,
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date()

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listObjetos: Objetos[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _objService: ObjetosService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService
    ) {}

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._objService.getAllObjetos()
      .subscribe((res: any) => {
        this.listObjetos = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'objeto') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    } else if (field === 'tipo_objeto' || field === 'descripcion'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  

  // Variable de estado para alternar funciones

toggleFunction(obj: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (obj.estado_objeto === 1 ) {
    this.inactivarObjeto(obj, i); // Ejecuta la primera función
  } else {
    this.activarObjeto(obj, i); // Ejecuta la segunda función
  }
}
 
  inactivarObjeto(objetos: any, i: number){
    this._objService.inactivarObjeto(objetos).subscribe(data => 
    this.toastr.success('El objeto: '+ objetos.objeto+ ' ha sido inactivado')
    );
    this.listObjetos[i].estado_objeto = 2;
  }
  activarObjeto(objetos: any, i: number){
    this._objService.activarObjeto(objetos).subscribe(data => 
    this.toastr.success('El objeto: '+ objetos.objeto+ ' ha sido activado')
    );
    this.listObjetos[i].estado_objeto = 1;
  }

  /*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Empresa', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listObjetos.forEach((obj, index) => {
    const row = [
      obj.objeto,
      obj.descripcion,
      obj.tipo_objeto,
      obj.creado_por,
      obj.fecha_creacion,
      obj.modificado_por,
      obj.fecha_modificacion,
      this.getEstadoText(obj.estado_objeto) // Función para obtener el texto del estado
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


  agregarNuevoObjeto() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoObjeto = {
      id_objeto: 0, 
      objeto: this.nuevoObjeto.objeto, 
      descripcion:this.nuevoObjeto.descripcion, 
      tipo_objeto: this.nuevoObjeto.tipo_objeto, 
      estado_objeto: 0,
      creado_por: userLocal, 
      fecha_creacion: new Date(), 
      modificado_por: userLocal, 
      fecha_modificacion: new Date()

    };

    this._objService.addObjeto(this.nuevoObjeto).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Objeto agregado con éxito');
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


  obtenerIdObjeto(objetos: Objetos, i: any){
    this.objetoEditando = {
    id_objeto: objetos.id_objeto, 
    objeto: objetos.objeto, 
    descripcion: objetos.descripcion, 
    tipo_objeto: objetos.tipo_objeto, 
    estado_objeto: objetos.estado_objeto,
    creado_por: objetos.creado_por, 
    fecha_creacion: objetos.fecha_creacion, 
    modificado_por: objetos.modificado_por, 
    fecha_modificacion: objetos.fecha_modificacion

    };
    this.indice = i;
  }


  editarObjeto(){
    this._objService.editarObjeto(this.objetoEditando).subscribe(data => {
      this.toastr.success('Objeto editado con éxito');
      this.listObjetos[this.indice].objeto = this.objetoEditando.objeto;
      this.listObjetos[this.indice].descripcion = this.objetoEditando.descripcion;
      this.listObjetos[this.indice].estado_objeto = this.objetoEditando.estado_objeto;
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

  insertBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 29,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA EL OBJETO CON EL ID: '+ dataObjeto.id_objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA EL OBJETO CON EL ID: '+ dataObjeto.id_objeto
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL OBJETO CON EL ID: '+ dataObjeto.id_objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL OBJETO CON EL ID: '+ dataObjeto.id_objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataObjeto: Objetos){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 29,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL OBJETO CON EL ID: '+ dataObjeto.id_objeto
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */
