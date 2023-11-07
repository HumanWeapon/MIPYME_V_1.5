import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Pyme  } from 'src/app/interfaces/pyme/pyme';
import { PymesService } from 'src/app/services/pyme/pyme.service';
import { ErrorService } from 'src/app/services/error.service';
import { NgZone } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';

@Component({
  selector: 'app-pyme',
  templateUrl: './pyme.component.html',
  styleUrls: ['./pyme.component.css']
})
export class PymeComponent {
  pymeEditando: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    categoria: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };


  nuevaPyme: Pyme = {
    id_pyme: 0,
    nombre_pyme: '',
    categoria: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPymes: Pyme[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _pymesService: PymesService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
  ) {}

  ngOnInit(): void {
  this.getUsuario()
  this.dtOptions = {
    pagingType: 'full_numbers',
    pageLength: 10,
    language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
    responsive: true,
  };
    this._pymesService.getAllPymes()
    .subscribe((res: any) => {
      this.listPymes = res;
      this.dtTrigger.next(null);
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  
/**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(pyme: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (pyme.estado === 1 ) {
    this.inactivarPyme(pyme, i); // Ejecuta la primera función
  } else {
    this.activarPyme(pyme, i); // Ejecuta la segunda función
  }
}
  
  activarPyme(nombre_pyme: any, i: number) {
    this._pymesService.activarPyme(nombre_pyme).subscribe(data =>
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido activada')
    );
    this.listPymes[i].estado = 1;
  }

  inactivarPyme(nombre_pyme: any, i: number) {
    this._pymesService.inactivarPyme(nombre_pyme).subscribe(data =>
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido inactivada')
    );
    this.listPymes[i].estado = 2;
  }
/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Pyme', 'Descripcion', 'Creado', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listPymes.forEach((pyme, index) => {
    const row = [
      pyme.nombre_pyme,
      pyme.descripcion,
      pyme.creado_por,
      this.getEstadoText(pyme.estado) // Función para obtener el texto del estado
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
      return 'Activo';
    case 2:
      return 'Inactivo';
    case 3:
      return 'Vencido';
    case 4:
      return 'Bloqueado';
    default:
      return 'Desconocido';
  }
}


/**************************************************************/
  agregarNuevaPyme() {
    this.nuevaPyme={
      id_pyme: 0,
      nombre_pyme: this.nuevaPyme.nombre_pyme,
      categoria: this.nuevaPyme.categoria,
      descripcion: this.nuevaPyme.descripcion,
      creado_por: 'ISMAELM',
      fecha_creacion: new Date(),
      modificado_por: 'ISMAELM',
      fecha_modificacion: new Date(),
      estado: 1
    };

    this._pymesService.addPyme(this.nuevaPyme).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Pyme Agregada Exitosamente')
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
    location.reload();
    this.ngZone.run(() => {        
    });
  }
    


/*******************************************************************************/
  onInputChange(event: any, field: string) {
    if (field === 'nombre_pyme' || field === 'descripcion'|| field === 'categoria') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }



/************************************************************************************/
  obtenerIdPyme(pyme: Pyme, i: any) {
    this.pymeEditando = {
      id_pyme: pyme.id_pyme,
      nombre_pyme: pyme.nombre_pyme,
      categoria: pyme.categoria,
      descripcion:pyme.descripcion,
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
    this._pymesService.editarPyme(this.pymeEditando).subscribe(data => {
      this.toastr.success('Pyme editada con éxito');
      this.listPymes[this.indice].nombre_pyme = this.pymeEditando.nombre_pyme;
      this.listPymes[this.indice].categoria = this.pymeEditando.categoria;
      this.listPymes[this.indice].descripcion = this.pymeEditando.descripcion;
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
    });
  }

  /***********************************************************************/

  deletePyme(id_pyme: number) {
    if (id_pyme !== undefined) {
      this._pymesService.deletePyme(id_pyme).subscribe(
        (data) => {
          // Elimina la pyme de la lista actual en el componente después de la eliminación
          this.listPymes.splice(id_pyme);
          this.toastr.success('La Pyme ha sido eliminada con éxito');
        },
        (error) => {
          console.error('Error al eliminar la Pyme', error);
          this.toastr.error('Error al eliminar la Pyme');
        }
      );
    } else {
      console.error('El valor de id_pyme es indefinido o no válido.');
    }
    location.reload();
    this.ngZone.run(() => {        
    });
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
      id_objeto: 15,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA LA PYME CON EL ID: '+  dataPyme.id_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 15,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA LA PYME CON EL ID: '+ dataPyme.id_pyme
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 15,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA LA PYME CON EL ID: '+ dataPyme.id_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 15,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA LA PYME CON EL ID: '+ dataPyme.id_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataPyme: Pyme){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 15,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA LA PYME CON EL ID: '+ dataPyme.id_pyme
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/



























}

