import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Empresa  } from 'src/app/interfaces/empresa/empresas';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { ErrorService } from 'src/app/services/error.service';
import { NgZone } from '@angular/core';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent {

  empresaEditando: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };


  nuevaEmpresa: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0
  };
  indice: any;

  dtOptions: DataTables.Settings = {};
  listEmpresa: Empresa[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _empresaService: EmpresaService,
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
    this._empresaService.getAllEmpresas()
    .subscribe((res: any) => {
      this.listEmpresa = res;
      this.dtTrigger.next(null);
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  
/**********************************************************/
// Variable de estado para alternar funciones

toggleFunction(empresa: any, i: number) {

  // Ejecuta una función u otra según el estado
  if (empresa.estado === 1 ) {
    this.inactivarEmpresa(empresa, i); // Ejecuta la primera función
  } else {
    this.activarEmpresa(empresa, i); // Ejecuta la segunda función
  }
}
  
  activarEmpresa(nombre_empresa: any, i: number) {
    this._empresaService.activarEmpresa(nombre_empresa).subscribe(data =>
      this.toastr.success('La Empresa: ' + nombre_empresa.nombre_empresa + ' ha sido activada')
    );
    this.listEmpresa[i].estado = 1;
  }

  inactivarEmpresa(nombre_empresa: any, i: number) {
    this._empresaService.inactivarEmpresa(nombre_empresa).subscribe(data =>
      this.toastr.success('La Empresa: ' + nombre_empresa.nombre_empresa + ' ha sido inactivada')
    );
    this.listEmpresa[i].estado = 2;
  }
/*****************************************************************************************************/

generatePDF() {

  const {jsPDF} = require ("jspdf");
 
  const doc = new jsPDF();
  const data: any[][] =[]
  const headers = ['Nombre Empresa', 'Descripcion', 'Creado', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listEmpresa.forEach((empresa, index) => {
    const row = [
      empresa.nombre_empresa,
      empresa.descripcion,
      empresa.creado_por,
      this.getEstadoText(empresa.estado) // Función para obtener el texto del estado
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
  agregarNuevaEmpresa() {
    this.nuevaEmpresa={
      id_empresa: 0,
      id_tipo_empresa:2,
      nombre_empresa: this.nuevaEmpresa.nombre_empresa,
      descripcion: this.nuevaEmpresa.descripcion,
      creado_por: 'ISMAELM',
      fecha_creacion: new Date(),
      modificado_por: 'ISMAELM',
      fecha_modificacion: new Date(),
      estado: 1
    };

    this._empresaService.addEmpresa(this.nuevaEmpresa).subscribe({
      next: (data) => {
        this.insertBitacora(data);
        this.toastr.success('Empresa Agregada Exitosamente')
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
    if (field === 'nombre_empresa' || field === 'descripcion') {
      const inputValue = event.target.value;
      const uppercaseValue = inputValue.toUpperCase();
      event.target.value = uppercaseValue;
    }
  }



/************************************************************************************/
  obtenerIdEmpresa(empresa: Empresa, i: any) {
    this.empresaEditando = {
      id_empresa: empresa.id_empresa,
      id_tipo_empresa:empresa.id_tipo_empresa,
      nombre_empresa: empresa.nombre_empresa,
      descripcion:empresa.descripcion,
      creado_por: empresa.creado_por,
      fecha_creacion: empresa.fecha_creacion,
      modificado_por: empresa.modificado_por,
      fecha_modificacion: empresa.fecha_modificacion,
      estado: empresa.estado
    };
    this.indice = i;
  }


  /************************************************************************/

  editarEmpresa(){
    this._empresaService.editarEmpresa(this.empresaEditando).subscribe(data => {
      this.toastr.success('Empresa editada con éxito');
      this.listEmpresa[this.indice].nombre_empresa = this.empresaEditando.nombre_empresa;
      this.listEmpresa[this.indice].descripcion = this.empresaEditando.descripcion;
        // Actualizar la vista
        this.ngZone.run(() => {        
        });
    
    });
  }

  /***********************************************************************/

  deleteEmpresa(id_empresa: number) {
    if (id_empresa !== undefined) {
        this._empresaService.deleteEmpresa(id_empresa).subscribe(
            (data) => {
                // Elimina la empresa de la lista actual en el componente después de la eliminación
                const index = this.listEmpresa.findIndex(empresa => empresa.id_empresa === id_empresa);
                if (index !== -1) {
                    this.listEmpresa.splice(index, 1);
                }
                this.toastr.success('La Empresa ha sido eliminada con éxito');
            },
            (error) => {
                console.error('Error al eliminar la Empresa', error);
                this.toastr.error('Error al eliminar la Empresa');
            }
        );
    } else {
        console.error('El valor de id_empresa es indefinido o no válido.');
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

  insertBitacora(dataEmpresa: Empresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.id_usuario,
      id_objeto: 10,
      accion: 'INSERTAR',
      descripcion: 'SE INSERTA LA EMPRESA CON EL ID: '+ dataEmpresa.id_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  updateBitacora(dataEmpresa: Empresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 10,
      accion: 'ACTUALIZAR',
      descripcion: 'SE ACTUALIZA EL PAIS CON EL ID: '+ dataEmpresa.id_empresa
    };
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  activarBitacora(dataEmpresa: Empresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 10,
      accion: 'ACTIVAR',
      descripcion: 'SE ACTIVA EL CONTACTO CON EL ID: '+ dataEmpresa.id_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  inactivarBitacora(dataEmpresa: Empresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 10,
      accion: 'INACTIVAR',
      descripcion: 'SE INACTIVA EL CONTACTO CON EL ID: '+ dataEmpresa.id_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
  deleteBitacora(dataEmpresa: Empresa){
    const bitacora = {
      fecha: new Date(),
      id_usuario: this.getUser.usuario,
      id_objeto: 10,
      accion: 'ELIMINAR',
      descripcion: 'SE ELIMINA EL CONTACTO CON EL ID: '+ dataEmpresa.id_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/



























}

