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
import { da } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español



@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent {
  
  getDireccion: any;

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}





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
      this.getUsuario();
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
  if (obj.estado == 1 ) {
    this.inactivarDireccion(obj, i); // Ejecuta la primera función
  } else {
    this.activarDireccion(obj, i); // Ejecuta la segunda función
  }
}
  
inactivarDireccion(direccion: ContactoDirecciones, i: any){
  this._objService.inactivarDireccion(direccion).subscribe(data => {
    this.toastr.success('La Direccion: '+ direccion.direccion+ ' ha sido inactivada');
    this.inactivarBitacora(data);

   } );
  this.listDirecciones[i].estado = 2;
}
activarDireccion(direccion: ContactoDirecciones, i: any){
  this._objService.activarDireccion(direccion).subscribe(data => {
  this.toastr.success('La Direccion: '+ direccion.direccion+ ' ha sido activada');
  this.activarBitacora(data);
});
  this.listDirecciones[i].estado = 1;
}


/*****************************************************************************************************/


generateExcel() {
  const headers = ['Direccion', 'Descripcion', 'Creado Por', 'Fecha de Creacion', 'Estado'];
  const data: any[][] = [];

  // Recorre los datos de tu lista de direcciones y agrégalo a la matriz 'data'
  this.listDirecciones.forEach((obj, index) => {
    const row = [
      obj.direccion,
      obj.descripcion,
      obj.creado_por,
      obj.fecha_creacion,
      this.getEstadoText(obj.estado) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  // Crea un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agrega la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Direcciones');

  // Guarda el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crea un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'My Pyme-Reporte Direcciones.xlsx';

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
  const headers = ['Direccion', 'Descripcion', 'Creado Por', 'Fecha de Creacion', 'Estado'];

  // Agregar el logo al PDF
  const logoImg = new Image();
  logoImg.onload = () => {
    // Dibujar el logo en el PDF
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño

    // Agregar los comentarios al PDF centrados horizontalmente
    const centerX = doc.internal.pageSize.getWidth() / 2;
    doc.setFontSize(12);
    doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Reporte de Direcciones", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
    doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente

    // Recorre los datos de direcciones y agrégalo a la matriz 'data'
    this.listDirecciones.forEach((obj, index) => {
      const row = [
        obj.direccion,
        obj.descripcion,
        obj.creado_por,
        obj.fecha_creacion,
        this.getEstadoText(obj.estado)
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
    doc.save('My Pyme-Reporte Direcciones.pdf');
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

insertBitacora(dataDireccion: ContactoDirecciones) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 6,
    accion: 'INSERTAR',
    descripcion: `SE AGREGÓ UNA NUEVA DIRECCIÓN:
                  Direccion: ${dataDireccion.direccion},
                  Descripción: ${dataDireccion.descripcion}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}



updateBitacora(dataDireccion: ContactoDirecciones) {
  // Guardar la dirección actual antes de actualizarla
  const direccionAnterior = { ...this.getDireccion };

  // Actualizar la dirección
  this.getDireccion = dataDireccion;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (direccionAnterior.direccion !== dataDireccion.direccion) {
    cambios.push(`Dirección anterior: ${direccionAnterior.direccion} -> Nueva dirección: ${dataDireccion.direccion}`);
  }
  if (direccionAnterior.descripcion !== dataDireccion.descripcion) {
    cambios.push(`Descripción anterior: ${direccionAnterior.descripcion} -> Nueva descripción: ${dataDireccion.descripcion}`);
  }

  // Si se realizaron cambios, registrar en la bitácora
  if (cambios.length > 0) {
    // Crear la descripción para la bitácora
    const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;

    // Crear el objeto bitácora
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 6,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Manejar la respuesta si es necesario
    });
  }
}


activarBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 6,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA LA DIRECCION: '+ dataDireccion.direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 6,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA LA DIRECCION: '+ dataDireccion.direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataDireccion: ContactoDirecciones){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 6,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA LA DIRECCION CON EL ID: '+ dataDireccion.direccion
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}



