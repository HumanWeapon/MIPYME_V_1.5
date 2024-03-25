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



@Component({
  selector: 'app-contacto-telefono',
  templateUrl:'./telefonos.component.html',
  styleUrls: ['./telefonos.component.css']
})
export class TelefonosComponent implements OnInit{

  getTelefono: any;
  telefonosconcontacto: any[] = [];
  localUser: string = '';
  list_contactos: any[] = [];


  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}


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
    private _datePipe: DatePipe
  ) {}

  
  ngOnInit(): void {
    this.getUsuario();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };

    this._contactoTService.getAllContactosTelefono().subscribe({
      next: (data) =>{
        this.telefonosconcontacto = data;
        this.list_contactos = data;
        this.dtTrigger.next(0);
      }
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
    this.telefonosconcontacto[i].estado = 2;
    this.telefonosconcontacto[i].modificado_por = this.localUser;
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
    this.telefonosconcontacto[i].estado = 1;
    this.telefonosconcontacto[i].modificado_por = this.localUser;
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


  /*****************************************************************************************************/

  generateExcel() {
    const headers = ['Telefono', 'Extensión', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];

    // Recorre los datos y agrégalos a la matriz 'data'
    this.telefonosconcontacto.forEach((conT, index) => {
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
  const doc = new jsPDF();
  const data: any[][] = [];
  const headers = ['Telefono', 'Cod_area', 'Descripción', 'Creado por', 'Fecha de Creación', 'Modificado por', 'Fecha de modificación', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Telefonos", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos y agrégalos a la matriz 'data'
    this.telefonosconcontacto.forEach((conT, index) => {
      const row = [
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
      startY: 70 // Ajusta la posición inicial de la tabla según tu diseño
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
              this.telefonosconcontacto.push(data);
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
  }


  editarContactoTelefono(){

    this.contactoTEditando.telefono = this.contactoTEditando.telefono.toUpperCase();
    this.contactoTEditando.descripcion = this.contactoTEditando.descripcion.toUpperCase();

    const esMismoTelefono = this.telefonosconcontacto[this.indice].telefono === this.contactoTEditando.telefono;

        // Si el usuario no es el mismo, verifica si el nombre de usuario ya existe
        if (!esMismoTelefono) {
          const TelefonoExistente = this.telefonosconcontacto.some(user => user.telefono === this.contactoTEditando.telefono);
          if (TelefonoExistente) {
            this.toastr.error('El Telefono ya esta registrado. Por favor, elige otro Telefono.');
            return;
          }
        }

    this._contactoTService.editarContactoTelefono(this.contactoTEditando).subscribe(data => {
      this.toastr.success('contacto editado con éxito');
      this.telefonosconcontacto[this.indice].telefono = this.contactoTEditando.telefono;
      this.telefonosconcontacto[this.indice].cod_area = this.contactoTEditando.cod_area;
      this.telefonosconcontacto[this.indice].descripcion = this.contactoTEditando.descripcion.toUpperCase();
      this.telefonosconcontacto[this.indice].nombre = data.contacto.toUpperCase();
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
    id_objeto: 7,
    accion: 'INSERTAR',
    descripcion: `SE INSERTA EL TELEFONO:
                  Teléfono: ${dataTelefonos.telefono},
                  Extensión: ${dataTelefonos.cod_area},
                  Descripción: ${dataTelefonos.descripcion}`
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    // Manejar la respuesta si es necesario
  });
}


updateBitacora(dataTelefono: ContactoTelefono) {
  // Guardar el teléfono actual antes de actualizarlo
  const telefonoAnterior = { ...this.getTelefono };

  // Actualizar el teléfono
  this.getTelefono = dataTelefono;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (telefonoAnterior.telefono !== dataTelefono.telefono) {
    cambios.push(`Teléfono anterior: ${telefonoAnterior.telefono} -> Nuevo Teléfono: ${dataTelefono.telefono}`);
  }
  if (telefonoAnterior.cod_area !== dataTelefono.cod_area) {
    cambios.push(`Extensión anterior: ${telefonoAnterior.cod_area} -> Nueva extensión: ${dataTelefono.cod_area}`);
  }
  if (telefonoAnterior.descripcion !== dataTelefono.descripcion) {
    cambios.push(`Descripción anterior: ${telefonoAnterior.descripcion} -> Nueva descripción: ${dataTelefono.descripcion}`);
  }
  // Puedes agregar más comparaciones para otros campos según tus necesidades

  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear la descripción para la bitácora
    const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;

    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getTelefono.id_usuario,
      id_objeto: 7,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}


activarBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL NUMERO DE TELEFONO: '+ dataTelefonos.telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}

inactivarBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL NUMERO DE TELEFONO: '+ dataTelefonos.telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}

deleteBitacora(dataTelefonos: ContactoTelefono){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 7,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL NUMERO DE TELEFONO: '+ dataTelefonos.telefono
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}














/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */

