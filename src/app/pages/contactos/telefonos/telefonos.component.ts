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
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { da, es } from 'date-fns/locale'; // Importa el idioma español
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { DatePipe } from '@angular/common';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';



@Component({
  selector: 'app-contacto-telefono',
  templateUrl:'./telefonos.component.html',
  styleUrls: ['./telefonos.component.css']
})
export class TelefonosComponent implements OnInit{

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;

  getTelefono: any;
  telefonosAllContactos: any[] = [];
  localUser: string = '';
  list_contactos: any[] = [];
  telefonoAnterior: any;


  contactoTEditando: ContactoTelefono = {
    id_telefono: 0, 
    id_contacto: 0,
    id_pais: 0,
    telefono: '', 
    cod_area: '',
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
    id_pais: 0,
    telefono: '', 
    cod_area: '',
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
    private _userService: UsuariosService,
    private _contactoService: ContactoService,
    private _datePipe: DatePipe,
    private _permisosService: PermisosService
  ) {}

  
  ngOnInit(): void {
    this.getUsuario();
    this.getPermnisosObjetos();
    this.getAllTelefonosContacto();
    this.getAllContactos();
  }

  getAllTelefonosContacto(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };

    this._contactoTService.telefonosAllContactosPais().subscribe({
      next: (data) =>{
        this.telefonosAllContactos = data; // Asigna los datos obtenidos del servicio a la variable telefonosAllContactos
        this.dtTrigger.next(0); // Notifica al DataTables que los datos han sido cargados
        console.log(data);
      },
      error: (error) => {
        console.error('Hubo un error al obtener los contactos:', error);
      }
    });
}


  getAllContactos(){
    this._contactoService.getAllContactos().subscribe(data => {
      this.list_contactos = data
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
    if (conT.estado == 1 ) {
      this.inactivarContactoTelefono(conT, i); // Ejecuta la primera función
    } else {
      this.activarContactoTelefono(conT, i); // Ejecuta la segunda función
    }
  }

  getPermnisosObjetos(){
    const idObjeto = localStorage.getItem('id_objeto');
    const idRol = localStorage.getItem('id_rol');
    if(idObjeto && idRol){
      this._permisosService.getPermnisosObjetos(idRol, idObjeto).subscribe({
        next: (data: any) => {
          this.consultar = data.permiso_consultar;
          this.insertar = data.permiso_insercion;
          this.actualizar = data.permiso_actualizacion;
          this.eliminar = data.permiso_eliminacion;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  }

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

  inactivarContactoTelefono(contactoTelefono: ContactoTelefono, i: any){
    this._contactoTService.inactivarContactoTelefono(contactoTelefono).subscribe({
      next: (data) => {
        this.inactivarBitacora(data);
        this.toastr.success('El telefono: '+ contactoTelefono.telefono + ' ha sido inactivado')
      },
    error: (e: HttpErrorResponse) => {
    this._errorService.msjError(e);
  }
  });
    this.telefonosAllContactos[i].estado = 2;
    this.telefonosAllContactos[i].modificado_por = this.localUser;
  }

  activarContactoTelefono(contactoTelefono: ContactoTelefono, i: any){
    this._contactoTService.activarContactoTelefono(contactoTelefono).subscribe({
      next: (data) => {
       this.activarBitacora(data);
       this.toastr.success('El telefono: '+ contactoTelefono.telefono  + ' ha sido activado')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    this.telefonosAllContactos[i].estado = 1;
    this.telefonosAllContactos[i].modificado_por = this.localUser;
  }

  convertirAMayusculas(event: any, field: string) {
    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
    });
  }
  
  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'telefono' || field === 'extension') {
        inputValue = inputValue.replace(/[^0-9]/g, ''); // Solo permite números
      } else if (field === 'descripcion') {
        inputValue = inputValue.replace(/[^a-zA-ZñÑ0-9\s]/g, ''); // Permite letras, números, espacios en blanco y ñ/Ñ
      }
      event.target.value = inputValue;
    });
}

  
  
  cancelarInput(){
     this.nuevoContactoT.telefono = '';
     this.nuevoContactoT.descripcion = '';
    }

    formatPhoneNumber(phoneNumber: string | null): string {
      if (phoneNumber === null || phoneNumber === undefined) {
          return ''; // Retorna una cadena vacía si phoneNumber es null o undefined
      }
  
      // Eliminar caracteres que no sean números
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      
      // Separar el número cada cuatro dígitos con el signo "-"
      const formattedNumber = cleanedNumber.match(/.{1,4}/g)?.join('-') || ''; // Usa el operador de opción segura (?.) y el operador de fusión nula (||)
      
      return formattedNumber;
  }


  /*****************************************************************************************************/

  generateExcel() {
    const headers = ['Telefono', 'Extensión', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];

    // Recorre los datos y agrégalos a la matriz 'data'
    this.telefonosAllContactos.forEach((conT, index) => {
        const row = [
            conT.telefono,
            conT.cod_area,
            conT.descripcion,
            conT.creado_por,
            conT.fecha_creacion,
            this.getEstadoText(conT.estado)
        ];
        data.push(row);
    });

    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contactos');

    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Telefonos.xlsx';

    document.body.appendChild(a);
    a.click();

    // Limpia el objeto URL creado
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

/*****************************************************************************************************/

generatePDF() {
  const { jsPDF } = require("jspdf");
  const doc = new jsPDF({ orientation: 'landscape' });

  const data: any[][] = [];
  const headers = ['ID', 'Teléfono', 'Cód. Área', 'Descripción', 'Creado por', 'Fecha de Creación', 'Modificado por', 'Fecha de Modificación', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Teléfonos", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Usuario: " + this.getUser.usuario, centerX, 50, { align: 'center' });

    // Recorre los datos y agrégalos a la matriz 'data'
    this.telefonosAllContactos.forEach((conT, index) => {
      const row = [
        conT.id_telefono, // Agregando el campo ID
        conT.telefono,
        conT.cod_area,
        conT.descripcion,
        conT.creado_por,
        conT.fecha_creacion,
        conT.modificado_por,
        conT.fecha_modificacion,
        this.getEstadoText(conT.estado)
      ];
      data.push(row);
    });

    // Agregar la tabla al PDF
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 70, // Ajusta la posición inicial de la tabla según tu diseño
      styles: {
        fontSize: 8 // Tamaño de fuente para la tabla
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Ancho de la columna ID
        1: { cellWidth: 30 }, // Ancho de la columna Teléfono
        2: { cellWidth: 25 }, // Ancho de la columna Cód. Área
        3: { cellWidth: 40 }, // Ancho de la columna Descripción
        4: { cellWidth: 30 }, // Ancho de la columna Creado por
        5: { cellWidth: 40 }, // Ancho de la columna Fecha de Creación
        6: { cellWidth: 30 }, // Ancho de la columna Modificado por
        7: { cellWidth: 40 }, // Ancho de la columna Fecha de Modificación
        8: { cellWidth: 20 } // Ancho de la columna Estado
      }
    });

    // Guardar el PDF
    doc.save('My Pyme-Reporte Contactos.pdf');
  };
  logoImg.src = '/assets/dist/img/pym.png'; // Ruta del logo
  }

  getCurrentDate(): string {
  const currentDate = new Date();
  return currentDate.toLocaleDateString(); // Retorna la fecha actual en formato local
  }

  getEstadoText(estado: number): string {
  switch (estado) {
    case 1:
      return 'ACTIVO';
    case 2:
      return 'INACTIVO';
    case 3:
      return 'BLOQUEADO';
    case 4:
      return 'VENCIDO';
    default:
      return 'Desconocido';
  }
  }

  /**************************************************************/


  agregarNuevoContactoT() {
    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
      const fechaActual = new Date();
      const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');

    this.nuevoContactoT = {
      id_telefono: 0, 
      id_contacto: 0,
      id_pais: 0,
      telefono: this.nuevoContactoT.telefono, 
      cod_area: this.nuevoContactoT.cod_area,
      descripcion:this.nuevoContactoT.descripcion,
      creado_por: userLocal,
      fecha_creacion: fechaFormateada as unknown as Date, 
      modificado_por: userLocal,
      fecha_modificacion: fechaFormateada as unknown as Date, 
      estado: 1,
    };
    if (!this.nuevoContactoT.telefono || !this.nuevoContactoT.descripcion || !this.nuevoContactoT.cod_area) {
      this.toastr.warning('Debes completar los campos vacíos');
      this.nuevoContactoT.telefono = '';
      this.nuevoContactoT.descripcion = '';
      this.nuevoContactoT.cod_area = '';
    }else{
      this._contactoTService.addContactoT(this.nuevoContactoT).subscribe({
          next: (data) => {
              this.insertBitacora(data);
              this.toastr.success('Contacto agregado con éxito');
              this.telefonosAllContactos.push(data);
          },
          error: (e: HttpErrorResponse) => {
              this._errorService.msjError(e);
          }
        });
      }
      }
    }

  obtenerIdContactoT(contactoT: ContactoTelefono, i: any){
    this.contactoTEditando = {
      id_telefono: contactoT.id_telefono, 
      id_contacto: contactoT.id_contacto,
      id_pais:contactoT.id_pais,
      telefono: contactoT.telefono, 
      cod_area: contactoT.cod_area,
      descripcion: contactoT.descripcion,
      creado_por: contactoT.creado_por, 
      fecha_creacion: contactoT.fecha_creacion, 
      modificado_por: contactoT.modificado_por, 
      fecha_modificacion: contactoT.fecha_modificacion, 
      estado: contactoT.estado,
    

    };
    this.indice = i;
    this.telefonoAnterior = contactoT;
  }


  editarContactoTelefono(){

    this.contactoTEditando.telefono = this.contactoTEditando.telefono.toUpperCase();
    this.contactoTEditando.descripcion = this.contactoTEditando.descripcion.toUpperCase();

    const esMismoTelefono = this.telefonosAllContactos[this.indice].telefono === this.contactoTEditando.telefono;

        // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
        if (!esMismoTelefono) {
          const TelefonoExistente = this.telefonosAllContactos.some(user => user.telefono === this.contactoTEditando.telefono);
          if (TelefonoExistente) {
            this.toastr.error('El Telefono ya esta registrado. Por favor, elige otro Telefono.');
            return;
          }
        }

    this._contactoTService.editarContactoTelefono(this.contactoTEditando).subscribe(data => {
      this.toastr.success('contacto editado con éxito');
      this.telefonosAllContactos[this.indice].telefono = this.contactoTEditando.telefono;
      this.telefonosAllContactos[this.indice].cod_area = this.contactoTEditando.cod_area;
      this.telefonosAllContactos[this.indice].descripcion = this.contactoTEditando.descripcion.toUpperCase();
      this.telefonosAllContactos[this.indice].nombre = data.contacto.toUpperCase();
      console.log(data);
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
    id_objeto: 7, // ID del objeto correspondiente a los teléfonos de contacto
    accion: 'INSERTAR',
    descripcion: `SE INSERTA EL TELÉFONO:
                  Teléfono: ${dataTelefonos.telefono},
                  Extensión: ${dataTelefonos.cod_area},
                  Descripción: ${dataTelefonos.descripcion}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataTelefonos: ContactoTelefono) {
  const cambios = [];
  if (this.telefonoAnterior.telefono !== dataTelefonos.telefono) {
    cambios.push(`Teléfono: ${dataTelefonos.telefono}`);
  }
  if (this.telefonoAnterior.cod_area !== dataTelefonos.cod_area) {
    cambios.push(`Extensión: ${dataTelefonos.cod_area}`);
  }
  if (this.telefonoAnterior.descripcion !== dataTelefonos.descripcion) {
    cambios.push(`Descripción: ${dataTelefonos.descripcion}`);
  }
 
  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario, // Usar el ID del usuario anterior para registrar el cambio
      id_objeto: 7, // ID del objeto correspondiente a los teléfonos de contacto
      campo_original: `Teléfono: ${this.telefonoAnterior.telefono}, Extensión: ${this.telefonoAnterior.cod_area}, Descripción: ${this.telefonoAnterior.descripcion}`, 
      nuevo_campo: cambios.join(', '),
      accion: 'ACTUALIZAR'
    }

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}


activarBitacora(dataTelefono: ContactoTelefono) { 
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7, // ID del objeto correspondiente a los teléfonos de contacto
    campo_original: 'EL TELÉFONO: '+ dataTelefono.telefono + ' SE ENCUENTRA "INACTIVO" ', 
    nuevo_campo: 'EL TELÉFONO: '+ dataTelefono.telefono + ' CAMBIO A "ACTIVO" ', 
    accion: 'ACTIVAR',
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

inactivarBitacora(dataTelefono: ContactoTelefono) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7, // ID del objeto correspondiente a los teléfonos de contacto
    campo_original: 'EL TELÉFONO: '+ dataTelefono.telefono + ' SE ENCUENTRA "ACTIVO" ', 
      nuevo_campo: 'EL TELÉFONO: '+ dataTelefono.telefono + ' CAMBIO A "INACTIVO" ', 
    accion: 'INACTIVAR'
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

deleteBitacora(dataTelefono: ContactoTelefono) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7, // ID del objeto correspondiente a los teléfonos de contacto
    campo_original: 'EL TELÉFONO'+ dataTelefono.telefono,
    nuevo_campo: 'SE HA ELIMINADO TELÉFONO',
    accion: 'ELIMINAR',
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}

  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}














/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */

