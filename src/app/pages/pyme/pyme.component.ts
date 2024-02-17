import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Pyme  } from 'src/app/interfaces/pyme/pyme';
import { ErrorService } from 'src/app/services/error.service';
import { NgZone } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';

@Component({
  selector: 'app-pyme',
  templateUrl: './pyme.component.html',
  styleUrls: ['./pyme.component.css']
})
export class PymeComponent {
  editPyme: Pyme = {
    id_pyme: 0,
    id_tipo_empresa: 1,
    nombre_pyme: '',
    rtn:'',
    categoria: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
  };

  newPyme: Pyme = {
    id_pyme: 0,
    id_tipo_empresa: 1,
    nombre_pyme: '',
    rtn:'',
    categoria: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPymes: Pyme[] = [];
  listCategorias: Categoria[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private categoriasService: CategoriaService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _pymesService: PymeService,
  ) {}


  ngOnInit(): void {
  this.getUsuario()
  this.getCategorias();
  this.dtOptions = {
    pagingType: 'full_numbers',
    pageLength: 10,
    language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
    responsive: true,
  };
    this._pymesService.getAllPymes()
    .subscribe({
      next: (data) =>{
        this.listPymes = data;
        this.dtTrigger.next(0);
      }
    });
    this.getUsuario();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  
/**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(pyme: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (pyme.estado == 1 ) {
    this.inactivarPyme(pyme, i); // Ejecuta la primera función
  } else {
    this.activarPyme(pyme, i); // Ejecuta la segunda función
  }
}
  
  activarPyme(nombre_pyme: any, i: number) {
    this._pymesService.activarPyme(nombre_pyme).subscribe(data => {
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido activada');
      this.activarBitacora(data);
  });
    this.listPymes[i].estado = 1;
  }

  inactivarPyme(nombre_pyme: any, i: number) {
    this._pymesService.inactivarPyme(nombre_pyme).subscribe(data =>{
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido inactivada');
      this.inactivarBitacora(data);
  });
    this.listPymes[i].estado = 2;
  }
/*****************************************************************************************************/

generatePDF() {
  const { jsPDF } = require("jspdf");
  const doc = new jsPDF();
  const data: any[][] = [];
  const headers = ['Nombre Pyme', 'Descripcion', 'Categoria', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];
  const usuario = localStorage.getItem('usuario');

  // Obtiene la fecha actual y la formatea
  const fechaActual = new Date();
  const fechaFormateada = fechaActual.toLocaleDateString();

  // Título del PDF centrado
  doc.setFontSize(16);
  doc.text('Reporte de Pymes', 105, 10, null, null, 'center');

  // Agrega una línea horizontal para separar el título y la descripción
  doc.line(10, 20, 200, 20);

  // Descripción
  doc.setFontSize(12);
  doc.text(`Reporte donde se muestran las Pymes registradas en la plataforma MYPIME`, 10, 30);

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listPymes.forEach((pyme, index) => {
    let estadoResult: any = '';
    if (pyme.estado === 1) {
      estadoResult = 'ACTIVO';
    } else {
      estadoResult = 'INACTIVO';
    }

    const row = [
      pyme.nombre_pyme,
      pyme.descripcion,
      pyme.categoria,
      pyme.creado_por,
      pyme.fecha_creacion,
      pyme.modificado_por,
      pyme.fecha_modificacion,
      estadoResult
    ];
    data.push(row);
  });

  // Genera la tabla
  const table = doc.autoTable({
    head: [headers],
    body: data,
    startY: 40
  });

  // Calcula la posición de la línea horizontal después de la tabla
  const tableBottomLine = table.lastAutoTable.finalY + 10;

  // Agrega una línea horizontal para separar la tabla y la información del usuario
  doc.line(10, tableBottomLine, 200, tableBottomLine);

  // Fecha en la parte inferior izquierda
  doc.setFontSize(12);
  doc.text(`Fecha de Reporte: ${fechaFormateada}`, 10, tableBottomLine + 10);

  // Usuario en la parte inferior izquierda, debajo de la fecha
  doc.setFontSize(12);
  doc.text(`Reporte Generado por el Usuario: ${usuario}`, 10, tableBottomLine + 20);

  // Muestra el Documento
  doc.output('dataurlnewwindow', null, 'Pymes.pdf');
}



/**************************************************************/
agregarNuevaPyme() {
  const userLocal = localStorage.getItem('usuario');
  if (userLocal) {
    this.newPyme = {
      id_pyme: 0,
      id_tipo_empresa: this.newPyme.id_tipo_empresa,
      nombre_pyme: this.newPyme.nombre_pyme.toUpperCase(),
      rtn:this.newPyme.rtn,
      descripcion: this.newPyme.descripcion,
      categoria: this.newPyme.categoria,
      creado_por: userLocal,
      fecha_creacion: new Date(),
      modificado_por: userLocal,
      fecha_modificacion: new Date(),
      estado: this.newPyme.estado
    };

    this._pymesService.addPyme(this.newPyme).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Pyme Agregada Exitosamente');

        // Agrega la nueva Pyme a la lista
        this.listPymes.push(data);
        
        // Actualiza la vista
        this.ngZone.run(() => {});
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
}
    


/*******************************************************************************/
  onInputChange(event: any, field: string) {
    if (field === 'nombre_pyme' || field === 'categoria') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }

  /************************************************************************************/
  obtenerIdPyme(pyme: Pyme, i: any) {
    this.editPyme = {
      id_pyme: pyme.id_pyme,
      id_tipo_empresa: pyme.id_tipo_empresa,
      nombre_pyme: pyme.nombre_pyme,
      rtn:pyme.rtn,
      descripcion: pyme.descripcion,
      categoria: pyme.categoria,
      creado_por: pyme.creado_por,
      fecha_creacion: pyme.fecha_creacion,
      modificado_por: pyme.modificado_por,
      fecha_modificacion: pyme.fecha_modificacion,
      estado: pyme.estado
    };
    this.indice = i;
  }

  /************************************************************************/

  editarPyme(){
    this._pymesService.editarPyme(this.editPyme).subscribe(data => {
      this.updateBitacora(data);
      this.toastr.success('Pyme editada con éxito');
      this.listPymes[this.indice].nombre_pyme = this.editPyme.nombre_pyme
      this.listPymes[this.indice].descripcion = this.editPyme.descripcion
      this.listPymes[this.indice].categoria = this.editPyme.categoria;
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
    });
  }

  getCategorias(){
    this.categoriasService.getAllCategorias().subscribe({
      next: (data: any) => {
        this.listCategorias = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  /***********************************************************************/

  deletePyme(id_pyme: number) {
    if (id_pyme !== undefined) {
        this._pymesService.deletePyme(id_pyme).subscribe(
            (data) => {
                // Elimina la pyme de la lista actual en el componente después de la eliminación
                const index = this.listPymes.findIndex(pyme => pyme.id_pyme === id_pyme);
                if (index !== -1) {
                    this.listPymes.splice(index, 1);
                }
                this.toastr.success('La Pyme ha sido eliminada con éxito');
                this.deleteBitacora(data)
                this.ngZone.run(() => {        
                });
            },
            (error) => {
                console.error('Error al eliminar la Pyme', error);
                this.toastr.error('Error al eliminar la Pyme');
            }
        );
    } else {
        console.error('El valor de id_pyme es indefinido o no válido.');
    }
}

  /*********************************************************************************************/













  /************************************************************************************************/



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

  insertBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA LA PYME: '+  dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA LA PYME: '+ dataPyme.nombre_pyme
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }

  activarBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA LA PYME: '+ dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA LA PYME: '+ dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 22,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA LA PYME CON EL ID: '+ dataPyme.nombre_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/



























}

