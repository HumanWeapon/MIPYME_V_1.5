import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})

export class PaisesComponent implements OnInit{
  getPais: any;


  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}


  paisEditando: Paises = {
    id_pais: 0, 
    id_contacto:0,
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0,
    cod_pais: ''
  };

  nuevoPais: Paises = {
    id_pais: 0,
    id_contacto:0, 
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0,
    cod_pais: ''
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPaises: Paises[] = [];
  data: any;
  

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _paisService: PaisesService, 
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService
    ) {}

  
  ngOnInit(): void {
    this.getUsuario()
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._paisService.getAllPaises()
      .subscribe((res: any) => {
        this.listPaises= res;
        console.log(res)
        this.dtTrigger.next(null);
      });
      this.getUsuario();

  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'paises') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    } else if (field === 'paises'){
      // Convierte a mayúsculas sin eliminar espacios en blanco
      event.target.value = inputValue.toUpperCase();
    }
  }
  
  // Variable de estado para alternar funciones

toggleFunction(paises: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (paises.estado == 1 ) {
    this.inactivarPais(paises, i); // Ejecuta la primera función
  } else {
    this.activarPais(paises, i); // Ejecuta la segunda función
  }
}
 
  inactivarPais(paises: Paises, i: any){
    this._paisService.inactivarPais(paises).subscribe(data => {
    this.toastr.success('El pais: '+ paises.pais+ ' ha sido inactivado');
    this.inactivarBitacora(data);
  });
    this.listPaises[i].estado = 2;
  }
  activarPais(paises: Paises, i: any){
    this._paisService.activarPais(paises).subscribe(data => {
    this.toastr.success('El pais: '+ paises.pais+ ' ha sido activado');
    this.activarBitacora(data);
  });
    this.listPaises[i].estado = 1;
  }




  /*****************************************************************************************************/

  generateExcelP() {
    const headers = ['País', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
    const data: any[][] = [];
  
    // Recorre los datos de tu lista de países y agrégalo a la matriz 'data'
    this.listPaises.forEach((pais, index) => {
      const row = [
        pais.pais,
        pais.descripcion,
        pais.creado_por,
        pais.fecha_creacion,
        this.getEstadoText(pais.estado) // Función para obtener el texto del estado
      ];
      data.push(row);
    });
  
    // Crea un nuevo libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  
    // Agrega la hoja al libro de Excel
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paises');
  
    // Guarda el libro de Excel como un archivo binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Crea un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);
  
    // Crea un enlace para descargar el archivo Excel
    const a = document.createElement('a');
    a.href = url;
    a.download = 'My Pyme-Reporte Paises.xlsx';
  
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
    const headers = ['País', 'Descripción', 'Creador', 'Fecha de Creación', 'Estado'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Países", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos de tu lista de países y agrégalo a la matriz 'data'
      this.listPaises.forEach((pais, index) => {
        const row = [
          pais.pais,
          pais.descripcion,
          pais.creado_por,
          pais.fecha_creacion,
          this.getEstadoText(pais.estado) // Función para obtener el texto del estado
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
      doc.save('My Pyme-Reporte Países.pdf');
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

  agregarNuevoPais() {

    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      this.nuevoPais = {
        id_pais: 0,  
        id_contacto:0,
        pais: this.nuevoPais.pais, 
        descripcion:this.nuevoPais.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: new Date(), 
        modificado_por: usuarioLocal, 
        fecha_modificacion: new Date(),
        cod_pais: ''
      };
      console.log(this.nuevoPais);
      this._paisService.addPais(this.nuevoPais).subscribe({
        next: (data) => {
          this.insertBitacora(data);
          this.toastr.success('Pais agregado con éxito')
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


  obtenerIdPais(paises: Paises, i: any){
    this.paisEditando = {
    id_contacto: paises.id_contacto,
    id_pais: paises.id_pais,
    pais: paises.pais, 
    descripcion: paises.descripcion,  
    creado_por: paises.creado_por, 
    fecha_creacion: paises.fecha_creacion, 
    modificado_por: paises.modificado_por, 
    fecha_modificacion: paises.fecha_modificacion,
    estado: paises.estado,
    cod_pais: ''
    };
    this.indice = i;
  
  }


  editarPais(){
    this._paisService.editarPais(this.paisEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Pais editado con éxito');
      this.listPaises[this.indice].pais = this.paisEditando.pais;
      this.listPaises[this.indice].pais = this.paisEditando.descripcion;
        // Recargar la página
        location.reload();
        // Actualizar la vista
              
        });
    
    };

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

insertBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'INSERTAR',
    descripcion: `SE INSERTA EL PAÍS: ${dataPais.pais}, Descripción: ${dataPais.descripcion}`
  };
  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Puedes manejar la respuesta si es necesario
  });
}

updateBitacora(dataPais: Paises) {
  // Guardar los datos del país actual antes de actualizarlos
  const paisAnterior = { ...this.getPais };

  // Actualizar los datos del país
  this.getPais = dataPais;

  // Comparar los datos anteriores con los nuevos datos
  const cambios = [];
  if (paisAnterior.pais !== dataPais.pais) {
    cambios.push(`País anterior: ${paisAnterior.pais} -> Nuevo País: ${dataPais.pais}`);
  }
  if (paisAnterior.descripcion !== dataPais.descripcion) {
    cambios.push(`Descripción anterior: ${paisAnterior.descripcion} -> Nueva Descripción: ${dataPais.descripcion}`);
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
      id_objeto: 19,
      accion: 'ACTUALIZAR',
      descripcion: descripcion
    };

    // Insertar la bitácora
    this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
      // Puedes manejar la respuesta si es necesario
    });
  }
}


activarBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'ACTIVAR',
    descripcion: 'SE ACTIVA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
inactivarBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'INACTIVAR',
    descripcion: 'SE INACTIVA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
deleteBitacora(dataPais: Paises){
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 19,
    accion: 'ELIMINAR',
    descripcion: 'SE ELIMINA EL PAIS: '+ dataPais.pais
  }
  this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
  })
}
  /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/


}
