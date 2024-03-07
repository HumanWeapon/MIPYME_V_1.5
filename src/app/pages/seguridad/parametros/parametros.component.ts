import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Parametros } from 'src/app/interfaces/seguridad/parametros';
import { ParametrosService } from 'src/app/services/seguridad/parametros.service';
import { NgZone } from '@angular/core';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Importa el idioma español
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 


@Component({
  selector: 'app-parametros',
  templateUrl:'./parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnInit{
  getUserId: any;
  getParametro: any;

  getDate(): string {
    // Obtener la fecha actual
    const currentDate = new Date();
    // Formatear la fecha en el formato deseado
    return format(currentDate, 'EEEE, dd MMMM yyyy', { locale: es });
}

  parametroEditando: Parametros = {
    id_parametro: 0,
    parametro: '',
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
    estado_parametro: 0,
  };

  nuevoParametro: Parametros = {
    id_parametro: 0,
    parametro: '',
    valor: 0,
    id_usuario: 0,
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    alerta_busqueda: 0, 
    estado_parametro: 0,
    
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listParametros: Parametros[] = [];
  data: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
 

  constructor(
    private _parametroService: ParametrosService, 
    private toastr: ToastrService,
    private router: Router, 
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService
    ) { }

  
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._parametroService.getAllParametros()
      .subscribe({
        next: (data) => {
        this.listParametros = data;
        this.dtTrigger.next(0);
      }
    });
    this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }


  onInputChange(event: any, field: string) {
    const inputValue = event.target.value;
    if (field === 'parametro') {
      // Convierte a mayúsculas y elimina espacios en blanco
      event.target.value = inputValue.toUpperCase().replace(/\s/g, '')
    }
  }

  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'parametro' || field === 'valor') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9]/g, ''); // Solo permite letras y números
      }
      event.target.value = inputValue;
    });
  }

  convertirAMayusculas(event: any, field: string) {
    setTimeout(() => {
      const inputValue = event.target.value;
      event.target.value = inputValue.toUpperCase();
    });
  }



   // Variable de estado para alternar funciones

toggleFunction(parametros: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (parametros.estado_parametro == 1 ) {
    this.inactivateParametro(parametros, i); // Ejecuta la primera función
  } else {
    this.activateParametro(parametros, i); // Ejecuta la segunda función
  }
}



inactivateParametro(parametro: any, i: number){
  this._parametroService.inactivateParametro(parametro).subscribe(data => {
    this.toastr.success('El Parámetro: '+ parametro.parametro+ ' ha sido inactivado');
    
    this.inactivarBitacora(data);
  });
  this.listParametros[i].estado_parametro = 2;
}
activateParametro(parametro: any, i: number){
  this._parametroService.activateParametro(parametro).subscribe(data => {
    this.toastr.success('El Parámetro: '+ parametro.parametro+ ' ha sido activado');

    this.activarBitacora(data);
    
  });
  this.listParametros[i].estado_parametro = 1;
}
 


   /*****************************************************************************************************/

generateExcel() {
  const headers = ['ID', 'Parámetro', 'Valor', 'ID Usuario', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];
  const data: any[][] = [];

  // Recorre los datos y agrégalos a la matriz 'data'
  this.listParametros.forEach((parametro) => {
    const row = [
      parametro.id_parametro,
      parametro.parametro,
      parametro.valor,
      parametro.id_usuario,
      parametro.creado_por,
      parametro.fecha_creacion,
      parametro.modificado_por,
      parametro.fecha_modificacion,
      this.getEstadoText(parametro.estado_parametro) // Función para obtener el texto del estado
    ];
    data.push(row);
  });

  // Crea un nuevo libro de Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Agrega la hoja al libro de Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parámetros');

  // Guarda el libro de Excel como un archivo binario
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Crea un objeto URL para el blob
  const url = window.URL.createObjectURL(blob);

  // Crea un enlace para descargar el archivo Excel
  const a = document.createElement('a');
  a.href = url;
  a.download = 'My Pyme-Reporte Parámetros.xlsx';

  document.body.appendChild(a);
  a.click();

  // Limpia el objeto URL creado
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}



   /*****************************************************************************************************/

   generatePDF() {
    const doc = new jsPDF();
    const data: any[][] = [];
    const headers = ['ID', 'Parámetro', 'Valor', 'ID Usuario', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];
  
    // Agregar el logo al PDF
    const logoImg = new Image();
    logoImg.onload = () => {
      // Dibujar el logo en el PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20); // Ajusta las coordenadas y dimensiones según tu diseño
  
      // Agregar los comentarios al PDF centrados horizontalmente
      const centerX = doc.internal.pageSize.getWidth() / 2;
      doc.setFontSize(12);
      doc.text("Utilidad Mi Pyme", centerX, 20, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Reporte de Parámetros", centerX, 30, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
      doc.text("Fecha: " + this.getCurrentDate(), centerX, 40, { align: 'center' }); // Ajusta las coordenadas vertical y horizontalmente
  
      // Recorre los datos y agrégalos a la matriz 'data'
      this.listParametros.forEach((parametro, index) => {
        const row = [
          parametro.id_parametro,
          parametro.parametro,
          parametro.valor,
          parametro.id_usuario,
          parametro.creado_por,
          parametro.fecha_creacion,
          parametro.modificado_por,
          parametro.fecha_modificacion,
          parametro.alerta_busqueda,
          this.getEstadoText(parametro.estado_parametro) // Función para obtener el texto del estado
        ];
        data.push(row);
      });
  
        
      // Guardar el PDF
      doc.save('My Pyme-Reporte Parámetros.pdf');
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
      default:
        return 'Desconocido';
    }
  }
  

/**************************************************************/


  agregarNuevoParametro() {

    this.nuevoParametro = {
      id_parametro: 0,
      parametro: this.nuevoParametro.parametro,
      estado_parametro: this.nuevoParametro.estado_parametro,
      valor: this.nuevoParametro.valor,
      id_usuario: 0,
      creado_por: '',
      fecha_creacion: new Date(),
      modificado_por: '',
      fecha_modificacion: new Date(),
      alerta_busqueda: 0, 
    };

    this._parametroService.addParametro(this.nuevoParametro).subscribe(data => {
      this.toastr.success('Parametro agregado con éxito');
    });

      // Recargar la página
      location.reload();
      // Actualizar la vista
      this.ngZone.run(() => {        
      });
  }


  obtenerIdParametro(parametro: Parametros, i: any){
    this.parametroEditando = {
      id_parametro: parametro.id_parametro,
      parametro: parametro.parametro,
      estado_parametro: parametro.estado_parametro,
      valor: parametro.valor,
      id_usuario: parametro.id_usuario,
      creado_por: parametro.creado_por,
      fecha_creacion: parametro.fecha_creacion,
      modificado_por: parametro.modificado_por,
      fecha_modificacion: parametro.fecha_modificacion,
      alerta_busqueda: parametro.alerta_busqueda, 
    };
    this.indice = i;
  }


  editarParametro(){
    this.parametroEditando.parametro = this.parametroEditando.parametro.toUpperCase();
    this.parametroEditando.creado_por = this.parametroEditando.creado_por.toUpperCase();
    this.parametroEditando.modificado_por = this.parametroEditando.modificado_por.toUpperCase();

    this._parametroService.editarParametro(this.parametroEditando).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Parametro editado con éxito');
      this.listParametros[this.indice].parametro = this.parametroEditando.parametro;
      this.listParametros[this.indice].valor = this.parametroEditando.valor;
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

 insertBitacora(dataParametro: Parametros) {
  const bitacora = {
    fecha: new Date(),
    id_usuario: this.getUser.id_usuario,
    id_objeto: 2,
    accion: 'INSERTAR',
    descripcion: `SE INSERTA EL PARÁMETRO:
                  Parámetro: ${dataParametro.parametro},
                  Valor: ${dataParametro.valor}`
  };

  this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
    // Manejar la respuesta si es necesario
  });
}


  
  updateBitacora(dataParametro: Parametros) {
    // Guardar el parámetro actual antes de actualizarlo
    const parametroAnterior = { ...this.getParametro };
  
    // Actualizar el parámetro
    this.getParametro = dataParametro;
  
    // Comparar los datos anteriores con los nuevos datos
    const cambios = [];
    if (parametroAnterior.parametro !== dataParametro.parametro) {
      cambios.push(`Nombre de parámetro anterior: ${parametroAnterior.parametro} -> por nuevo nombre: ${dataParametro.parametro}`);
    }
    if (parametroAnterior.valor !== dataParametro.valor) {
      cambios.push(`Valor anterior: ${parametroAnterior.valor} -> por nuevo valor: ${dataParametro.valor}`);
    }
    // Puedes agregar más comparaciones para otros campos según tus necesidades
  
    // Si se realizaron cambios, registrar en la bitácora
    if (cambios.length > 0) {
      // Crear la descripción para la bitácora
      const descripcion = `Se actualizaron los siguientes campos:\n${cambios.join('\n')}`;
  
      // Crear el objeto bitácora
      const bitacora = {
        fecha: new Date(),
        id_usuario: this.getUserId(), // Suponiendo que tengas un método para obtener el ID del usuario actual
        id_objeto: 2, // Suponiendo que el ID del objeto de parámetros es 2
        accion: 'ACTUALIZAR',
        descripcion: descripcion
      };
  
      // Insertar la bitácora
      this._bitacoraService.insertBitacora(bitacora).subscribe(data => {
        // Manejar la respuesta si es necesario
      });
    }
  }
  
  activarBitacora(dataParametro: Parametros){
    console.log(dataParametro);
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL PARAMETRO: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      
    })
  }
  inactivarBitacora(dataParametro: Parametros){
    console.log(dataParametro);
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL PARAMETRO: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
      
    })
  }
  deleteBitacora(dataParametro: Parametros){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 2,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL PARAMETRO: '+ dataParametro.parametro
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}










/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */