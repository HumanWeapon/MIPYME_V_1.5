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
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español



@Component({
  selector: 'app-contacto',
  templateUrl:'./contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit{
  getContacto: any;


  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}


  usuario: string = '';
  listContactosActivos: any[]=[];
  contacteditar: any;
  
  contactoEditando: Contacto = {
    id_contacto: 0,
    id_empresa: 0,
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
    id_empresa:0,
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
      if (field === 'primer_nombre' || field === 'segundo_nombre' || field === 'primer_apellido' || field === 'segundo_apellido') {
        inputValue = inputValue.replace(/[^a-zA-Z\s]/g, ''); // Solo permite letras y espacios en blanco
      } else if (field === 'descripcion') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Solo permite letras, números y espacios en blanco
      }
      event.target.value = inputValue;
    });
  }
  
  
  cancelarInput(){
     this.nuevoContacto.primer_nombre = '';
     this.nuevoContacto.segundo_nombre = '';
     this.nuevoContacto.primer_apellido = '';
     this.nuevoContacto.segundo_apellido = '';
     this.nuevoContacto.descripcion = '';
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


  generateExcel() {
    const headers = ['Nombre', 'Descripción', 'Creado Por', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];
  
    // Recorre los datos de tu lista de contactos y agrégalo a la matriz 'data'
    this.listContacto.forEach((contac, index) => {
      const row = [
        `${contac.primer_nombre} ${contac.segundo_nombre} ${contac.primer_apellido} ${contac.segundo_apellido}`,
        contac.descripcion,
        contac.creado_por,
        contac.fecha_creacion,
        this.getEstadoText(contac.estado)
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
    a.download = 'My Pyme-Reporte Contactos.xlsx';
  
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
  const headers = ['Nombre', 'Descripción', 'Creado Por', 'Fecha de Creación', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Contactos", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de usuarios y agrégalo a la matriz 'data'
    this.listContacto.forEach((contac, index) => {
      const row = [
        `${contac.primer_nombre} ${contac.segundo_nombre} ${contac.primer_apellido} ${contac.segundo_apellido}`,
        contac.descripcion,
        contac.creado_por,
        contac.fecha_creacion,
        this.getEstadoText(contac.estado)
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
      return 'Activo';
    case 2:
      return 'Inactivo';
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
      id_empresa: this.nuevoContacto.id_empresa,
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
          this.insertBitacora(data);
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
      id_empresa: contac.id_empresa,
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
  
   insertBitacora(dataContacto: Contacto) {
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 17,
      accion: 'INSERTAR',
      descripcion: `SE AGREGÓ UN NUEVO CONTACTO:
                    Primer Nombre: ${dataContacto.primer_nombre},
                    Segundo Nombre: ${dataContacto.segundo_nombre},
                    Primer Apellido: ${dataContacto.primer_apellido},
                    Segundo Apellido: ${dataContacto.segundo_apellido},
                    Descripción: ${dataContacto.descripcion},
                    }`
    };
  
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
  
  updateBitacora(dataContacto: Contacto) {
    // Guardar el contacto actual antes de actualizarlo
    const contactoAnterior = { ...this.getContacto };
  
    // Actualizar el contacto
    this.getContacto = dataContacto;
  
    // Comparar los datos anteriores con los nuevos datos
    const cambios = [];
    if (contactoAnterior.primer_nombre !== dataContacto.primer_nombre) {
      cambios.push(`Primer nombre anterior: ${contactoAnterior.primer_nombre} -> Nuevo primer nombre: ${dataContacto.primer_nombre}`);
    }
    if (contactoAnterior.segundo_nombre !== dataContacto.segundo_nombre) {
      cambios.push(`Segundo nombre anterior: ${contactoAnterior.segundo_nombre} -> Nuevo segundo nombre: ${dataContacto.segundo_nombre}`);
    }
    if (contactoAnterior.primer_apellido !== dataContacto.primer_apellido) {
      cambios.push(`Primer apellido anterior: ${contactoAnterior.primer_apellido} -> Nuevo primer apellido: ${dataContacto.primer_apellido}`);
    }
    if (contactoAnterior.segundo_apellido !== dataContacto.segundo_apellido) {
      cambios.push(`Segundo apellido anterior: ${contactoAnterior.segundo_apellido} -> Nuevo segundo apellido: ${dataContacto.segundo_apellido}`);
    }
    if (contactoAnterior.descripcion !== dataContacto.descripcion) {
      cambios.push(`Descripción anterior: ${contactoAnterior.descripcion} -> Nueva descripción: ${dataContacto.descripcion}`);
    }
   
    // Puedes agregar más comparaciones para otros campos según tus necesidades
  
    // Si se realizaron cambios, registrar en la bitácora
    if (cambios.length > 0) {
      // Crear la descripción para la bitácora
      const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;
  
      // Crear el objeto bitácora
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'ACTUALIZAR',
        descripcion: descripcion
      };
  
      // Insertar la bitácora
      this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
        // Manejar la respuesta si es necesario
      });
    }
  }
  
    activarBitacora(dataContacto: Contacto){
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUser.id_usuario,
        id_objeto: 17,
        accion: 'ACTIVAR',
        descripcion: 'SE ACTIVA EL CONTACTO DE: '+ dataContacto.primer_nombre + dataContacto.primer_apellido
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
        descripcion: 'SE INACTIVA EL CONTACTO DE: '+ dataContacto.primer_nombre + dataContacto.primer_apellido
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
        descripcion: 'SE ELIMINA EL CONTACTO DE: '+ dataContacto.primer_nombre + dataContacto.primer_apellido
      }
      this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      })
    }
      /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/





}



















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */