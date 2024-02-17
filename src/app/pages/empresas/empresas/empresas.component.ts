import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { ContactoDirecciones } from 'src/app/interfaces/contacto/contactoDirecciones';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { DireccionesService } from 'src/app/services/contacto/direcciones.service';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { TipoDireccion } from 'src/app/interfaces/mantenimiento/tipoDireccion';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { ContactoService } from 'src/app/services/contacto/contacto.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent {

  /*******Empresas************/
  empresaEditando: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    web: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 0,
    rtn:''
  };

  nuevaEmpresa: Empresa = {
    id_empresa: 0,
    id_tipo_empresa:0,
    nombre_empresa: '',
    descripcion: '',
    web: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 1,
    rtn:''
  };
  /******* Fin Empresas************/

  /*******Paises************/
  paisEditando: Paises = {
    id_pais: 0, 
    id_contacto:0,
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0
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
    estado: 1
  };
    /*******Fin Paises************/

    /*******Direccion************/
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
      estado: 1
    };
    /*******Fin Direccion************/

    /*******Telefono************/
    contactoTEditando: ContactoTelefono = {
      id_telefono: 0, 
      id_contacto: 0,
      id_tipo_telefono: 0,
      telefono: '', 
      extencion: '',
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
      id_tipo_telefono: 0,
      telefono: '', 
      extencion: '',
      descripcion:'',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
      estado: 0,
    };
    /*******Fin Telefono************/

    /*******Producto************/
    productoEditando: Productos = {
      id_producto: 0, 
      id_categoria: 0,
      id_contacto: 0,
      id_pais: 0, 
      producto:'', 
      descripcion: '', 
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(), 
      estado: 0
    };
  
    nuevoProducto: Productos = {
      id_producto: 0, 
      id_categoria: 0, 
      id_contacto: 0,
      id_pais: 0, 
      producto:'', 
      descripcion: '', 
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(), 
      estado: 1
    };
    /*******Fin Producto************/

  indice: any;

  dtOptions: DataTables.Settings = {};
  listEmpresa: Empresa[] = [];
  listPaises: Paises[] = [];
  listProductos: Productos[] = [];
  listTipoDireccion: TipoDireccion[] = [];
  listCategorias: Categoria[] = [];
  listContactos: Contacto[] = [];
  data: any; 

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  private _categoriaProductos: any;


  constructor(
    private _empresaService: EmpresaService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _userService: UsuariosService,
    private _paisesService: PaisesService,
    private _productoService: ProductosService,
    private _direccionService: DireccionesService,
    private _telefonoService: ContactoTService,
    private _tipoDireccionService: TipoDireccionService,
    private _tipoCategoriaService: CategoriaService,
    private _contactoService: ContactoService,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
  this.getUsuario();
  this.getPaises();
  this.getTipoDireccion();
  this.getContacto();
  this.getTipoCategoria();
  
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

  ocultarModal() {
    const modal = this.el.nativeElement.querySelector('#agregarEmpresa');
    modal.classList.remove('show');
    modal.style.display = 'none';
    const modalBackdrop = document.querySelector('.modal-backdrop');
    modalBackdrop?.parentNode?.removeChild(modalBackdrop);
  }

  ocultarModalDireccion() {
    const modal = this.el.nativeElement.querySelector('#agregarDireccion');
    modal.classList.remove('show');
    modal.style.display = 'none';
    const modalBackdrop = document.querySelector('.modal-backdrop');
    modalBackdrop?.parentNode?.removeChild(modalBackdrop);
  }


  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

/****************OBTENCION DE DATOS************************/

getPaises(){
  this._paisesService.getAllPaises().subscribe({
    next: (data: any) => {
      this.listPaises = data;
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}

getProductos(){
  this._productoService.getAllProductos().subscribe({
    next: (data: any) => {
      this.listProductos = data;
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}

getTipoDireccion(){
  this._tipoDireccionService.getAllTipoDirecciones().subscribe({
    next: (data: any) => {
      this.listTipoDireccion = data;
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}

getTipoCategoria(){
  this._tipoCategoriaService.getAllCategorias().subscribe({
    next: (data: any) => {
      this.listCategorias = data;
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}

getContacto(){
  this._contactoService.getAllContactos().subscribe({
    next: (data: any) => {
      this.listContactos = data;
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  });
}
/**********************************************************/

/*****************Insertar Datos****************************/

agregarTodo() {
  this.agregarNuevaDireccion();
  this.agregarNuevaEmpresa();
  this.agregarNuevoProducto();
  this.agregarNuevoTelefono();
}

agregarNuevaDireccion() {
  const usuarioLocal = localStorage.getItem('usuario');
  
  if (!usuarioLocal) {
    // Manejar el caso en el que no hay usuario local
    return;
  }

  this.nuevaDireccion = {
    id_direccion: 0, 
    id_tipo_direccion: this.nuevaDireccion.id_tipo_direccion, 
    direccion: this.nuevaDireccion.direccion, 
    descripcion: this.nuevaDireccion.descripcion, 
    estado: 1,
    creado_por: usuarioLocal, 
    fecha_creacion: new Date(), 
    modificado_por: usuarioLocal, 
    fecha_modificacion: new Date()
  };

  this._direccionService.addDireccion(this.nuevaDireccion).subscribe({
    next: (data) => {
      this.toastr.success('Dirección agregada con éxito');
    },
    error: (e: HttpErrorResponse) => {
      this.handleError(e, 'Error al agregar dirección');
    }
  });
}

agregarNuevoTelefono() {
  const userLocal = localStorage.getItem('usuario');

  if (!userLocal) {
    // Manejar el caso en el que no hay usuario local
    return;
  }

  this.nuevoContactoT = {
    id_telefono: 0, 
    id_contacto: 0,
    id_tipo_telefono: 0,
    telefono: this.nuevoContactoT.telefono, 
    extencion: "504",
    descripcion: "504",
    creado_por: userLocal,
    fecha_creacion: new Date(), 
    modificado_por: userLocal,
    fecha_modificacion: new Date(),
    estado: 0,
  };

  this._telefonoService.addContactoT(this.nuevoContactoT).subscribe({
    next: (data) => {
      this.toastr.success('Contacto agregado con éxito');
    },
    error: (e: HttpErrorResponse) => {
      this.handleError(e, 'Error al agregar contacto');
    }
  });
}

agregarNuevoProducto() {
  const usuarioLocal = localStorage.getItem('usuario');
  
  if (!usuarioLocal) {
    // Manejar el caso en el que no hay usuario local
    return;
  }

  this.nuevoProducto = {
    id_producto: 0, 
    id_categoria: this.nuevoProducto.id_categoria, 
    id_contacto: this.nuevoProducto.id_categoria,
    id_pais: this.nuevoProducto.id_pais,
    producto: this.nuevoProducto.producto, 
    descripcion: this.nuevoProducto.descripcion, 
    estado: 1,
    creado_por: usuarioLocal, 
    fecha_creacion: new Date(), 
    modificado_por: usuarioLocal, 
    fecha_modificacion: new Date()
  };

  this._productoService.addProducto(this.nuevoProducto).subscribe({
    next: (data) => {
      this.toastr.success('Producto agregado con éxito');
    },
    error: (e: HttpErrorResponse) => {
      this.handleError(e, 'Error al agregar producto');
    }
  });
}

agregarNuevaEmpresa() {
  const userLocal = localStorage.getItem('usuario');

  if (!userLocal) {
    // Manejar el caso en el que no hay usuario local
    return;
  }

  this.nuevaEmpresa = {
    id_empresa: 0,
    id_tipo_empresa: 2,
    nombre_empresa: this.nuevaEmpresa.nombre_empresa,
    descripcion: this.nuevaEmpresa.descripcion,
    creado_por: userLocal,
    web: '',
    fecha_creacion: new Date(),
    modificado_por: userLocal,
    fecha_modificacion: new Date(),
    estado: 1,
    rtn: ''
  };

  this._empresaService.addEmpresa(this.nuevaEmpresa).subscribe({
    next: (data) => {
      this.toastr.success('Empresa agregada con éxito');
    },
    error: (e: HttpErrorResponse) => {
      this.handleError(e, 'Error al agregar empresa');
    }
  });
}

handleError(error: HttpErrorResponse, errorMessage: string) {
  if (error.error instanceof ErrorEvent) {
    // Error del lado del cliente
    console.error('Ocurrió un error:', error.error.message);
  } else {
    // El backend retornó un código de error
    console.error(
      `El servidor retornó el código ${error.status}, ` +
      `mensaje: ${error.error}`);
  }

  // Mostrar mensaje de error al usuario
  this.toastr.error(errorMessage);
}

/************************************************************/
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
  const headers = ['Nombre Empresa', 'Descripcion', 'Creador', 'Fecha', 'Modificado por', 'Fecha', 'Estado'];

  // Recorre los datos de tu DataTable y agrégalo a la matriz 'data'
  this.listEmpresa.forEach((empresa, index) => {
    const row = [
      empresa.nombre_empresa,
      empresa.descripcion,
      empresa.creado_por,
      empresa.fecha_creacion,
      empresa.modificado_por,
      empresa.fecha_modificacion,
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
      return 'ACTIVO';
    case 2:
      return 'INACTIVO';
    default:
      return 'Desconocido';
  }
}

/**************************************************************/


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
      web: empresa.web,
      creado_por: empresa.creado_por,
      fecha_creacion: empresa.fecha_creacion,
      modificado_por: empresa.modificado_por,
      fecha_modificacion: empresa.fecha_modificacion,
      estado: empresa.estado,
      rtn:empresa.rtn
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
      descripcion: 'SE ACTUALIZA LA EMPRESA CON EL ID: '+ dataEmpresa.id_empresa
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
      descripcion: 'SE ACTIVA LA EMPRESA CON EL ID: '+ dataEmpresa.id_empresa
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
      descripcion: 'SE INACTIVA LA EMPRESA CON EL ID: '+ dataEmpresa.id_empresa
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
      descripcion: 'SE ELIMINA LA EMPRESA CON EL ID: '+ dataEmpresa.id_empresa
    }
    this._bitacoraService.insertBitacora(bitacora).subscribe(data =>{
    })
  }
    /*************************************************************** Fin Métodos de Bitácora ***************************************************************************/

}

