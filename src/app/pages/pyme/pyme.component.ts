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
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { Empresa } from 'src/app/interfaces/empresa/empresas';

@Component({
  selector: 'app-pyme',
  templateUrl: './pyme.component.html',
  styleUrls: ['./pyme.component.css']
})
export class PymeComponent {
  editEmpresa: Empresa = {
    id_empresa: 0,
    id_tipo_empresa: 0,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
    rtn:''
  };

  newEmpresa: Empresa = {
    id_empresa: 0,
    id_tipo_empresa: 1,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
    rtn:''
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listPymes: Empresa[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _empresasService: EmpresaService,
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
    this._empresasService.getEmpresasPymes(1)
    .subscribe({
      next: (data) =>{
        this.listPymes = data;
        this.dtTrigger.next(0);
      }
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
    this._empresasService.activarEmpresa(nombre_pyme).subscribe(data =>
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido activada')
    );
    this.listPymes[i].estado = 1;
  }

  inactivarPyme(nombre_pyme: any, i: number) {
    this._empresasService.inactivarEmpresa(nombre_pyme).subscribe(data =>
      this.toastr.success('La Pyme: ' + nombre_pyme.nombre_pyme + ' ha sido inactivada')
    );
    this.listPymes[i].estado = 2;
  }
/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Pyme', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listPymes.forEach((pyme, index) => {

    let estadoResult: any = '';
    if(pyme.estado === 1){
      estadoResult = 'ACTIVO'
    }else{
      estadoResult = 'INACTIVO'
    }

    const row = [
      pyme.nombre_empresa,
      pyme.descripcion,
      pyme.creado_por,
      pyme.fecha_creacion,
      pyme.modificado_por,
      pyme.fecha_modificacion,
      estadoResult
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

    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
      this.newEmpresa={
        id_empresa: 0,
        id_tipo_empresa: this.newEmpresa.id_tipo_empresa,
        nombre_empresa: this.newEmpresa.nombre_empresa,
        descripcion: this.newEmpresa.descripcion,
        creado_por: userLocal,
        fecha_creacion: new Date(),
        modificado_por: userLocal,
        fecha_modificacion: new Date(),
        estado: 1,
        rtn:''
      };
  
      this._empresasService.addEmpresa(this.newEmpresa).subscribe({
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
  obtenerIdPyme(pyme: Empresa, i: any) {
    this.editEmpresa = {
      id_empresa: pyme.id_empresa,
      id_tipo_empresa: pyme.id_tipo_empresa,
      nombre_empresa: pyme.nombre_empresa,
      descripcion: pyme.descripcion,
      creado_por: pyme.creado_por,
      fecha_creacion: pyme.fecha_creacion,
      modificado_por: pyme.modificado_por,
      fecha_modificacion: pyme.fecha_modificacion,
      estado: 0,
      rtn:''
    };
    this.indice = i;
  }

  /************************************************************************/

  editarPyme(){
    this._empresasService.editarEmpresa(this.editEmpresa).subscribe(data => {
      this.toastr.success('Pyme editada con éxito');
      this.listPymes[this.indice].nombre_empresa = this.editEmpresa.nombre_empresa;
      this.listPymes[this.indice].descripcion = this.editEmpresa.descripcion;
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
    });
  }

  /***********************************************************************/

  deletePyme(id_pyme: number) {
    if (id_pyme !== undefined) {
        this._empresasService.deleteEmpresa(id_pyme).subscribe(
            (data) => {
                // Elimina la pyme de la lista actual en el componente después de la eliminación
                const index = this.listPymes.findIndex(pyme => pyme.id_empresa === id_pyme);
                if (index !== -1) {
                    this.listPymes.splice(index, 1);
                }
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

