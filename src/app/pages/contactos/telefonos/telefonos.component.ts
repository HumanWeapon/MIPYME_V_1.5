import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { NgZone } from '@angular/core';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';



@Component({
  selector: 'app-contacto-telefono',
  templateUrl:'./telefonos.component.html',
  styleUrls: ['./telefonos.component.css']
})
export class TelefonosComponent implements OnInit{

  contactoTEditando: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: '', 
    extencion: '',
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };

  nuevoContactoT: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: '', 
    extencion: '',
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listContactoT: ContactoTelefono[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private _contactoTService: ContactoTService,
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

    this._contactoTService.getAllContactosTelefono()
      .subscribe((res: any) => {
        this.listContactoT = res;
        this.dtTrigger.next(null);
      });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


onInputChange(event: any, field: string) {
  if (field === 'descripcion') {
    const inputValue = event.target.value;
    const uppercaseValue = inputValue.toUpperCase();
    event.target.value = uppercaseValue;
  }
}

// Variable de estado para alternar funciones

toggleFunction(conT: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (conT.estado === 1 ) {
    this.inactivarContactoTelefono(conT, i); // Ejecuta la primera función
  } else {
    this.activarContactoTelefono(conT, i); // Ejecuta la segunda función
  }
}

  inactivarContactoTelefono(contactoTelefono: ContactoTelefono, i: any){
    this._contactoTService.inactivarContactoTelefono(contactoTelefono).subscribe(data => 
    this.toastr.success('El telefono: '+ contactoTelefono.telefono + ' ha sido inactivado')
    );
    this.listContactoT[i].estado = 2;
  }
  activarContactoTelefono(contactoTelefono: ContactoTelefono, i: any){
    this._contactoTService.activarContactoTelefono(contactoTelefono).subscribe(data => 
      this.toastr.success('La telefono: '+ contactoTelefono.telefono  + ' ha sido activado')
      );
    this.listContactoT[i].estado = 1;
  }

/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Telefono','Extencion', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listContactoT.forEach((conT, index) => {
    const row = [
      conT.telefono,
      conT.extencion,
      conT.descripcion,
      conT.creado_por,
      conT.fecha_creacion,
      conT.modificado_por,
      conT.fecha_modificacion,
      this.getEstadoText(conT.estado) // Función para obtener el texto del estado
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

  agregarNuevoContactoT() {

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
    this.nuevoContactoT = {
      id_telefono: 0, 
      id_contacto: 0,
      id_tipo_telefono: 0,
      telefono: this.nuevoContactoT.telefono, 
      extencion: this.nuevoContactoT.extencion,
      descripcion:this.nuevoContactoT.descripcion,
      creado_por: userLocal,
      fecha_creacion: new Date(), 
      modificado_por: userLocal,
      fecha_modificacion: new Date(),
      estado: 0,
    };

    this._contactoTService.addContactoT(this.nuevoContactoT).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Contacto agregado con éxito');
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


  obtenerIdContactoT(contactoT: ContactoTelefono, i: any){
    this.contactoTEditando = {
      id_telefono: contactoT.id_telefono, 
      id_contacto: contactoT.id_contacto,
      id_tipo_telefono: contactoT. id_tipo_telefono,
      telefono: contactoT.telefono, 
      extencion: contactoT.extencion,
      descripcion: contactoT.descripcion,
      creado_por: contactoT.creado_por, 
      fecha_creacion: contactoT.fecha_creacion, 
      modificado_por: contactoT.modificado_por, 
      fecha_modificacion: contactoT.fecha_modificacion,
      estado: contactoT.estado,
    

    };
    this.indice = i;
  }


  editarContactoTelefono(){
    this._contactoTService.editarContactoTelefono(this.contactoTEditando).subscribe(data => {
      this.toastr.success('contacto editado con éxito');
      this.listContactoT[this.indice].telefono = this.contactoTEditando.telefono;
      this.listContactoT[this.indice].extencion = this.contactoTEditando.extencion;
      this.listContactoT[this.indice].descripcion = this.contactoTEditando.descripcion;

      
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

insertBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7,
    accion: 'INSERTAR',
    descripcion: 'SE INSERTA EL TELEFONO CON EL ID: '+ dataTelefonos.id_telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
updateBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 7,
    accion: 'ACTUALIZAR',
    descripcion: 'SE ACTUALIZA EL TELEFONO CON EL ID: '+ dataTelefonos.id_telefono
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
activarBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 7,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL TELEFONO CON EL ID: '+ dataTelefonos.id_telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 7,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL TELEFONO CON EL ID: '+ dataTelefonos.id_telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.usuario,
    id_objeto: 7,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL TELEFONO CON EL ID: '+ dataTelefonos.id_telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}














/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */

