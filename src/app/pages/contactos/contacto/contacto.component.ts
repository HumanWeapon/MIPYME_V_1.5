import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { TipoContactoService } from 'src/app/services/mantenimiento/tipoContacto.service';
import { da } from 'date-fns/locale';



@Component({
  selector: 'app-contacto',
  templateUrl:'./contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit{
  usuario: string = '';
  listContactosActivos: any[]=[];
  contacteditar: any;
  contactoEditando: Contacto = {
    id_contacto: 0,
    id_tipo_contacto: 0,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,
  };

  nuevoContacto: Contacto = {
    id_contacto: 0,
    id_tipo_contacto: 0,
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,

  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listContacto: any[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 


  constructor(
    private _contactoService: ContactoService, 
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _tipoContacto: TipoContactoService,
    private toastr: ToastrService,
    private ngZone: NgZone
    ) { }

  
  ngOnInit(): void {
    this.variablesInicializadas();
    this.getUsuario();
    this.getTipoContactoActivos();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._contactoService.getAllContactosconTipoContacto()
      .subscribe((res: any) => {
        this.listContacto = res;
        this.dtTrigger.next(null);
      });
      this.getUsuario();
  }
  variablesInicializadas(){
    const localUser = localStorage.getItem('usuario');
    if (localUser) {
      this.usuario = localUser;
    }
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  getTipoContactoActivos(){
    this._tipoContacto.getAllTipoContactosActicvos().subscribe({
      next: (data)=> {
        this.listContactosActivos = data
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value; // Mueve esta línea fuera del condicional para definir inputValue independientemente del campo
    
    if (field === 'primer_nombre' || field === 'segundo_nombre'
    || field === 'primer_apellido' || field === 'segundo_apellido'
    || field === 'correo' || field === 'descripcion') {
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    } else if (field === 'dni') {
      // Convierte a mayúsculas y elimina espacios en blanco
      const uppercaseValue = inputValue.replace(/\s/g, '');
      event.target.value = uppercaseValue;
    }
  }

// Variable de estado para alternar funciones

toggleFunction(contac: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (contac.estado == 1 ) {
    this.inactivarContacto(contac, i); // Ejecuta la primera función
  } else {
    this.activarContacto(contac, i); // Ejecuta la segunda función
  }
}

  inactivarContacto(contacto: Contacto, i: any){
    this._contactoService.inactivarContacto(contacto).subscribe(data => {
    this.toastr.success('El contacto: '+ contacto.primer_nombre + ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
    this.listContacto[i].estado = 2; 
  }
  activarContacto(contacto: Contacto, i: any){
    this._contactoService.activarContacto(contacto).subscribe(data => {
    this.toastr.success('El contacto: '+ contacto.primer_nombre + ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listContacto[i].estado = 1;
  }

/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['DNI','Nombre Contacto','Correo' ,'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listContacto.forEach((contac, index) => {
    const row = [
      contac.primer_nombre +" "+ contac.segundo_nombre+" "+ contac.primer_apellido +" "+contac.segundo_apellido,
      contac.descripcion,
      contac.creado_por,
      contac.fecha_creacion,
      contac.fecha_modificacion,
      this.getEstadoText(contac.estado) // Función para obtener el texto del estado
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

agregarNuevoContacto() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal){
    this.nuevoContacto = {
      id_contacto: 0,
      id_tipo_contacto: this.nuevoContacto.id_tipo_contacto, 
      primer_nombre: this.nuevoContacto.primer_nombre,
      segundo_nombre: this.nuevoContacto.segundo_nombre, 
      primer_apellido: this.nuevoContacto.primer_apellido,
      segundo_apellido: this.nuevoContacto.segundo_apellido,   
      descripcion:this.nuevoContacto.descripcion,
      creado_por: userLocal,
      fecha_creacion: new Date(), 
      modificado_por: userLocal, 
      fecha_modificacion: new Date(),
      estado: 1,

    };
    if (!this.nuevoContacto.primer_nombre || !this.nuevoContacto.primer_apellido || !this.nuevoContacto.descripcion || !this.nuevoContacto.descripcion) {
      this.toastr.warning('Campos vacíos');
    }
    else{
      this._contactoService.addContacto(this.nuevoContacto).subscribe({
        next: (data) => {
          console.log(data);
          //this.insertBitacora(data);
          this.toastr.success('Contacto Agregado Exitosamente');
          this.listContacto.push(data);
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }
}


  obtenerIdContacto(contac: any, i: any){
    this.contactoEditando = {
      id_contacto: contac.id_contacto,
      id_tipo_contacto: contac.tipo_contacto.id_tipo_contacto,
      primer_nombre: contac.primer_nombre,
      segundo_nombre: contac.segundo_nombre,
      primer_apellido: contac.primer_apellido,
      segundo_apellido: contac.segundo_nombre,
      descripcion: contac.descripcion,
      creado_por: contac.creado_por,
      fecha_creacion: contac.fecha_creacion, 
      modificado_por: this.usuario,
      fecha_modificacion: new Date(), 
      estado: contac.estado,

    };
    this.indice = i;
  }
  editarContacto(){
    this._contactoService.editarContacto(this.contactoEditando).subscribe({
      next: (data) => {
        //this.listContacto[this.indice].tipo_contacto =
        this.updateBitacora(data);
        this.toastr.success('contacto editado con éxito');
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    const tipoContacto = this.listContactosActivos.find(contacto => contacto.id_tipo_contacto == this.contactoEditando.id_tipo_contacto);
    this.listContacto[this.indice].primer_nombre = this.contactoEditando.primer_nombre.toUpperCase();
    this.listContacto[this.indice].segundo_nombre = this.contactoEditando.segundo_nombre.toUpperCase();
    this.listContacto[this.indice].primer_apellido = this.contactoEditando.primer_apellido.toUpperCase();
    this.listContacto[this.indice].segundo_apellido = this.contactoEditando.segundo_apellido.toUpperCase();
    this.listContacto[this.indice].descripcion = this.contactoEditando.descripcion.toUpperCase();
    this.listContacto[this.indice].modificado_por = this.contactoEditando.modificado_por.toUpperCase();
    this.listContacto[this.indice].fecha_modificacion = this.contactoEditando.fecha_modificacion,
    this.listContacto[this.indice].tipo_contacto = tipoContacto
  }

  obtenerNombreTipoContacto(idTipoContacto: number): string {
    const tipoContacto = this.listContactosActivos.find(contacto => contacto.id_tipo_contacto == idTipoContacto);
    return tipoContacto.tipo_contacto;
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
  
    insertBitacora(dataContacto: Contacto){
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'INSERTAR',
        descripcion: 'SE INSERTA EL CONTACTO CON EL ID: '+ dataContacto.id_contacto
      }
      this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      })
    }
    updateBitacora(dataContacto: Contacto){
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'ACTUALIZAR',
        descripcion: 'SE ACTUALIZA EL CONTACTO CON EL ID: '+ dataContacto.id_contacto
      };
      this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      })
    }
    activarBitacora(dataContacto: Contacto){
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'ACTIVAR',
        descripcion: 'SE ACTIVA EL CONTACTO CON EL ID: '+ dataContacto.id_contacto
      }
      this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      })
    }
    inactivarBitacora(dataContacto: Contacto){
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'INACTIVAR',
        descripcion: 'SE INACTIVA EL CONTACTO CON EL ID: '+ dataContacto.id_contacto
      }
      this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      })
    }
    deleteBitacora(dataContacto: Contacto){
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'ELIMINAR',
        descripcion: 'SE ELIMINA EL CONTACTO CON EL ID: '+ dataContacto.id_contacto
      }
      this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      })
    }
      /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/





}



















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */