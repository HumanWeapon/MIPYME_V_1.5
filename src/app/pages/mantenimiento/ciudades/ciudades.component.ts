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
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { da } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español



@Component({
  selector: 'app-ciudades',
  templateUrl:'./ciudades.component.html',
  styleUrls: ['./ciudades.component.css']
})
export class CiudadesComponent implements OnInit{

  getCity: any;


  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

  listPaises: Paises[] = [];
  id_pais: number = 0;
  ciudadEditando: Ciudades = {
    id_ciudad: 0, 
    ciudad: '', 
    descripcion:'',
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(),
    estado: 0,
    id_pais: 0

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
    id_pais: 0
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listCiudades: any[] = [];
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
    private ngZone: NgZone,
    private _paisService: PaisesService
    ) {}

  
  ngOnInit(): void {
    this.getPais();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._ciudadService.getAllCiudades()
      .subscribe((res: any) => {
        console.log(res);
        this.listCiudades = res;
        this.dtTrigger.next(null);
      });
      this.getUsuario();
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
  if (ciu.estado == 1 ) {
    console.log(ciu);

    this.inactivarCiudad(ciu, i); // Ejecuta la primera función
  } else {
    this.activarCiudad(ciu, i); // Ejecuta la segunda función
  }
}

  inactivarCiudad(ciudades: any, i: any){
    const inactivarCiudad : Ciudades = {
      id_ciudad: ciudades.id_ciudad, 
      ciudad: ciudades.ciudad, 
      descripcion: ciudades.descripcion,
      creado_por: ciudades.creado_por, 
      fecha_creacion: ciudades.fecha_creacion, 
      modificado_por: ciudades.modificado_por, 
      fecha_modificacion: ciudades.fecha_modificacion,
      estado: ciudades.estado,
      id_pais: ciudades.id_pais
    };
    console.log(inactivarCiudad);
    this._ciudadService.inactivarCiudad(inactivarCiudad).subscribe(data => {
    this.toastr.success('La Ciudad: '+ ciudades.ciudad + ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
    this.listCiudades[i].estado = 2;
  }
  activarCiudad(ciudades: any, i: any){
    const activarCiudad : Ciudades = {
      id_ciudad: ciudades.id_ciudad, 
      ciudad: ciudades.ciudad, 
      descripcion: ciudades.descripcion,
      creado_por: ciudades.creado_por, 
      fecha_creacion: ciudades.fecha_creacion, 
      modificado_por: ciudades.modificado_por, 
      fecha_modificacion: ciudades.fecha_modificacion,
      estado: ciudades.estado,
      id_pais: ciudades.id_pais
    };
    console.log(activarCiudad);
    this._ciudadService.activarCiudad(activarCiudad).subscribe(data => {
    this.toastr.success('La ciudad: '+ ciudades.ciudad + ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listCiudades[i].estado = 1;
  }

  /*****************************************************************************************************/

  generateExcel() {
    const headers = ['Ciudad', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];
  
    // Recorre los datos de tu lista de ciudades y agrégalo a la matriz 'data'
    this.listCiudades.forEach((ciu, index) => {
      const row = [
        ciu.ciudad,
        ciu.descripcion,
        ciu.creado_por,
        ciu.fecha_creacion,
        this.getEstadoText(ciu.estado) // Función para obtener el texto del estado
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ciudades');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Ciudades.xlsx';
  
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
    const headers = ['Ciudad', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Ciudades", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos de tu lista de ciudades y agrégalo a la matriz 'data'
      this.listCiudades.forEach((ciu, index) => {
        const row = [
          ciu.ciudad,
          ciu.descripcion,
          ciu.creado_por,
          ciu.fecha_creacion,
          this.getEstadoText(ciu.estado) // Función para obtener el texto del estado
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
      doc.save('My Pyme-Reporte Ciudades.pdf');
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

  getPais(){
    this._paisService.getAllPaises().subscribe({
      next: (data) => {
        this.listPaises = data;
      },
      error: (e: HttpErrorResponse)=> {
        this._errorService.msjError(e);
      }
    });
  }
  tipoEmpresaSeleccionado(event: Event): void {
    const idPais = (event.target as HTMLSelectElement).value;
    this.id_pais = Number(idPais);
  }
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
      id_pais: this.id_pais
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
      id_pais: ciudades.id_pais
    };
    this.indice = i;
  }


  editarCiudad(){
    this._ciudadService.editarCiudad(this.ciudadEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Ciudad editada con éxito');
      this.listCiudades[this.indice].ciudad = this.ciudadEditando.ciudad;
      this.listCiudades[this.indice].descripcion = this.ciudadEditando.descripcion;

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
    id_objeto: 18,
    accion: 'INSERTAR',
    descripcion: `SE AGREGÓ UNA NUEVA CIUDAD:
                  Ciudad: ${dataCiudad.ciudad},
                  Descripción: ${dataCiudad.descripcion}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar la respuesta si es necesario
  });
}


// Actualizar la bitácora para una ciudad
updateBitacora(dataCiudad: Ciudades) {
  // Guardar los datos de la ciudad actual antes de actualizarlos
  const ciudadAnterior = { ...this.getCity };

  // Actualizar los datos de la ciudad
  this.getCity = dataCiudad;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (ciudadAnterior.ciudad !== dataCiudad.ciudad) {
    cambios.push(`Ciudad anterior: ${ciudadAnterior.ciudad} -> Nueva Ciudad: ${dataCiudad.ciudad}`);
  }
  if (ciudadAnterior.descripcion !== dataCiudad.descripcion) {
    cambios.push(`Descripción anterior: ${ciudadAnterior.descripcion} -> Nueva Descripción: ${dataCiudad.descripcion}`);
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
      id_objeto: 18,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Puedes manejar la respuesta si es necesario
    });
  }
}


// Activar la bitácora para una ciudad
activarBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 18,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA LA CIUDAD: ' + dataCiudad.ciudad
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

// Inactivar la bitácora para una ciudad
inactivarBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 18,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA LA CIUDAD: ' + dataCiudad.ciudad
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar el éxito aquí si es necesario
  });
}

// Eliminar la bitácora para una ciudad
deleteBitacora(dataCiudad: Ciudades) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 18,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA LA CIUDAD: ' + dataCiudad.ciudad
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
