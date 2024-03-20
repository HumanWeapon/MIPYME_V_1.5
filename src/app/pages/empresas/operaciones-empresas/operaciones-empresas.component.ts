import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { da } from 'date-fns/locale';
import { data, error } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { ErrorService } from 'src/app/services/error.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { TipoContactoService } from 'src/app/services/mantenimiento/tipoContacto.service';
import { EmpresasContactosService } from 'src/app/services/operaciones/empresas-contactos.service';
import { EmpresasProdcutosService } from 'src/app/services/operaciones/empresas-prodcutos.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-operaciones-empresas',
  templateUrl: './operaciones-empresas.component.html',
  styleUrls: ['./operaciones-empresas.component.css']
})
export class OperacionesEmpresasComponent {
  // Variables obtenidas del Local Store, Información de la Empresa.
  idEmpresa: any;
  nombreEmpresa: string = '';
  descripcionEmpresa: string = '';
  usuario: string = '';
  productos: any[] = [];
  listCategorias: Categoria[] = [];
  listContacto: any[] = [];
  listContactosActivos: any[]=[];
  indice: any;//indice de contactos
  
  productosEmpresa: any[] = [];//Obtiene los productos registrados de la Empresa y los muestra en la tabla.
  productosContactos: any[] = [];//Obtiene los contactos registrados de la Empresa y los muestra en la tabla.
  contactosActivos: any[] = []; //Obtiene los contactos activos de la Empresa y los muestra en la tabla.
  telefonosContactos: any[] = [];//Obtiene los telefonos registrados para cada contacto.

  //Obtiene los productos no registrados para la empresa y mostrarlos en el modal de agregar productos.
  listNuevosProductos: any[] = []; //guarda los registros de mi consulta a la api
  listEditandoProductos: any[] = []; //Guardan la misma información, luego se comparan 
  posee_producto = true;

  //Obtiene los contactos no registrados para la empresa y mostrarlos en el modal de agregar productos.
  listNuevosContactos: any[] = []; //guarda los registros de mi consulta a la api
  listEditandoContactos: any[] = []; //Guardan la misma información, luego se comparan 
  posee_contacto = true;

  //Obtiene la información del buscador de mi tabla productos
  filtro_prod: string = '';
  filtro_contact: string = '';
  todosLosProductos: any[] = [];
  todosLosContactos: any[] = [];
  filtroModalProd: string = '';
  filtroModalCont: string = '';


  listProductos: any[] = [];

  nuevaEmpresa: Empresa = {
    id_empresa: 0,
    id_tipo_empresa: 1,
    nombre_empresa: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 1
  };

  nuevoProducto: any = { 
    id_categoria: '', 
    producto:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 1
  };

  operaciones_empresas = {
    id_empresa: '',
    id_producto: '',
    id_contacto: '',
    id_pais: '',
    id_requisito: '',
    casa_matriz: false,
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(),
    modificado_por: '',
    fecha_modificacion: new Date(),
    estado: 1
  }

  nuevoContacto: Contacto = {
    id_contacto: 0,
    id_empresa:0,
    id_tipo_contacto: 0,
    nombre_completo: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,
  };
  contactoEditando: Contacto = {
    id_contacto: 0,
    id_empresa: 0,
    id_tipo_contacto: 0,
    nombre_completo: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,
  };
  ngOnInit(){
    this.getProductos();
    this.getAllCategorias();
    this.getTipoContactoActivos();
    //this.getEmpresasProductos();
    const EmpresaId = localStorage.getItem('idEmpresa');
    const EmpresaNombre = localStorage.getItem('nombreEmpresa');
    const EmpresaDescripcion = localStorage.getItem('nombreEmpresa');
    const userLocal = localStorage.getItem('usuario');
    if(EmpresaNombre && EmpresaDescripcion && EmpresaId && userLocal){
      this.idEmpresa = EmpresaId;
      this.nombreEmpresa = EmpresaNombre;
      this.descripcionEmpresa = EmpresaDescripcion;
      this.usuario = userLocal;
    }
    this.getEmpresasProductosPorId();
    this.getProductosNoRegistradosPorId();
    this.getEmpresasContactosPorId();
    this.getContactosNoRegistradosPorId();
  }

  constructor(
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private _router: Router,
    private _empresaService: EmpresaService,
    private _bitacoraService: BitacoraService,
    private _userService: UsuariosService,
    private _productoService: ProductosService,
    private _empresasProductosService: EmpresasProdcutosService,
    private _empresasContactosService: EmpresasContactosService,
    private _telefonosService: ContactoTService,
    private _datePipe: DatePipe,
    private _categoriaProductos: CategoriaService,
    private _contactoService: ContactoService,
    private _tipoContacto: TipoContactoService,
  ) {}

  //busca los productos de la tabla principal de los productos
  buscarProductos() {
    if (this.filtro_prod.trim() === '') {
      this.productosEmpresa = this.todosLosProductos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.productosEmpresa = this.todosLosProductos.filter(producto => {
        // Filtrar por el nombre del producto
        return producto.producto.producto.toLowerCase().includes(this.filtro_prod.trim().toLowerCase());
      });
    }
  }
  //busca los productos de la tabla de productos en el modal
  buscarProductosModal() {
    if (this.filtroModalProd.trim() === '') {
      this.listNuevosProductos = this.listEditandoProductos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.listNuevosProductos = this.listEditandoProductos.filter(producto => {
        // Filtrar por el nombre del producto
        return producto.producto.toLowerCase().includes(this.filtroModalProd.trim().toLowerCase());
      });
    }
  }
  //busca los productos de la tabla principal de los contactos
  buscarContactos() {
    if (this.filtro_contact.trim() === '') {
      this.productosContactos = this.todosLosContactos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.productosContactos = this.todosLosContactos.filter(contacto => {
        // Filtrar por el nombre del producto
        return contacto.nombre_completo.toLowerCase().includes(this.filtro_contact.trim().toLowerCase());
      });
    }
  }
  //busca los productos de la tabla de contactos en el modal
  buscarContactosModal() {
    if (this.filtroModalCont.trim() === '') {
      this.listNuevosContactos = this.listEditandoContactos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.listNuevosContactos = this.listEditandoContactos.filter(contacto => {
        // Filtrar por el nombre del producto
        return contacto.nombre_completo.toLowerCase().includes(this.filtroModalCont.trim().toLowerCase());
      });
    }
  }
  buscarTelefonos(id_contacto: any){
    this._telefonosService.telefonosdeContactosPorId(id_contacto).subscribe({
      next: (data) =>{
        this.telefonosContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  agregarEmpresa(){
    const userLocal = localStorage.getItem('usuario');
    if(userLocal){
      this.nuevaEmpresa = {
        id_empresa: 0,
        id_tipo_empresa: this.nuevaEmpresa.id_tipo_empresa,
        nombre_empresa: this.nuevaEmpresa.nombre_empresa,
        descripcion: this.nuevaEmpresa.descripcion,
        creado_por: userLocal,
        fecha_creacion: new Date(),
        modificado_por: userLocal,
        fecha_modificacion: new Date(),
        estado: 1,
      };
      this._empresaService.addEmpresa(this.nuevaEmpresa).subscribe({
        next: (data: any) => {
          this.operaciones_empresas.id_empresa = data.id_empresa;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
  };

  agregarNuevoProducto() {
    const usuarioLocal = localStorage.getItem('usuario')
    if(usuarioLocal){
      const fechaActual = new Date();
      const fechaFormateada = this._datePipe.transform(fechaActual, 'yyyy-MM-dd');
      this.nuevoProducto = {
        id_producto: 0, 
        id_contacto:0,
        id_pais:0,
        id_categoria: this.nuevoProducto.id_categoria,
        producto: this.nuevoProducto.producto, 
        descripcion:this.nuevoProducto.descripcion, 
        estado: 1,
        creado_por: usuarioLocal, 
        fecha_creacion: fechaFormateada as unknown as Date,
        modificado_por: usuarioLocal, 
        fecha_modificacion: fechaFormateada as unknown as Date,

      };
      if (!this.nuevoProducto.producto || !this.nuevoProducto.descripcion) {
        this._toastr.warning('Debes completar los campos vacíos');
      }else{
        this._productoService.addProducto(this.nuevoProducto).subscribe({
          next: (data) => {
            console.log(data);
            this._toastr.success('Producto agregado con éxito');
            this.productos.push(data);
            this.getProductosNoRegistradosPorId();
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
  }
  getAllCategorias(){
    this._categoriaProductos.getAllCategorias().subscribe(data => {
      this.listCategorias = data.filter(categoria => categoria.estado == 1);
    });
  }
  /**
   * Tab Productos
   * Se muestran los métodos para obtener los productos de la base de datos.
   * se muestran los productos no registrados en las empresas.
   * se insertan y eliminan productos de acuerdo a la solcitud de los usuarios.
   */
  getProductos(){
    this._productoService.getAllProductosActivos().subscribe({
      next: (data: any) => {
        this.listProductos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  //Obtiene todos los productos registrados a una empresa
  getEmpresasProductosPorId() {
    this._empresasProductosService.consultarOperacionEmpresaProductoPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.productosEmpresa = data;
        this.todosLosProductos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  agregarNuevoContacto() {
    const userLocal = localStorage.getItem('usuario');
    if (userLocal){
      this.nuevoContacto = {
        id_contacto: 0,
        id_empresa: this.nuevoContacto.id_empresa,
        id_tipo_contacto: this.nuevoContacto.id_tipo_contacto, 
        nombre_completo: this.nuevoContacto.nombre_completo, 
        descripcion:this.nuevoContacto.descripcion,
        creado_por: userLocal,
        fecha_creacion: new Date(), 
        modificado_por: userLocal, 
        fecha_modificacion: new Date(),
        estado: 1,
  
      };
      if (!this.nuevoContacto.nombre_completo || !this.nuevoContacto.descripcion || !this.nuevoContacto.descripcion) {
        this._toastr.warning('Campos vacíos');
      }
      else{
        this._contactoService.addContacto(this.nuevoContacto).subscribe({
          next: (data) => {
            console.log(data);
            this._toastr.success('Contacto Agregado Exitosamente');
            this.listContacto.push(data);
          },
          error: (e: HttpErrorResponse) => {
            this._errorService.msjError(e);
          }
        });
      }
    }
  }
  cancelarInput(){
    this.nuevoContacto.nombre_completo = '';
    this.nuevoContacto.descripcion = '';
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
  //Obtiene todos los contactos registrados a una empresa
  getEmpresasContactosPorId() {
    this._empresasContactosService.consultarContactosPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.productosContactos = data;
        this.todosLosContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  //Obtiene todos los productos registrados y no registrados de una empresa
  getProductosNoRegistradosPorId() {
    this._empresasProductosService.consultarProductosNoRegistradosPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.listNuevosProductos = data;
        this.listEditandoProductos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  //Obtiene todos los contactos registrados y no registrados de una empresa
  getContactosNoRegistradosPorId() {
    this._empresasContactosService.consultarContactosNoRegistradosPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.listNuevosContactos = data;
        this.listEditandoContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }


  //Funciones para marcar o desmarcar en el modal
  marcarProducto(producto: any) {
    producto.posee_producto = true; // Marcar el producto
  }
  desmarcarProducto(producto: any) {
    producto.posee_producto = false; // Desmarcar el producto
  }
  marcarContacto(contacto: any) {
    contacto.posee_contacto = true; // Marcar el contacto
  }
  
  desmarcarContacto(contacto: any) {
    contacto.posee_contacto = false; // Desmarcar el contacto
  }



  EditarProductos() {
    const productosMarcados = this.listNuevosProductos.filter(producto => producto.posee_producto);
    const productosDesmarcados = this.listNuevosProductos.filter(producto => !producto.posee_producto);
    
    productosMarcados.forEach(producto => {
      if (!producto.id_empresa) {
        // Si el producto no tiene un ID de empresa, significa que no estaba registrado anteriormente,
        // así que debemos insertarlo en la base de datos.
        this.insertarProducto(producto);
      }
    });
    productosDesmarcados.forEach(producto => {
      if (producto.id_empresa) {
        // Si el producto tenía un ID de empresa (estaba activo anteriormente),
        // entonces debemos eliminarlo de la base de datos.
        this.eliminarProducto(producto);
      }
    });
  }

  obtenerIdContacto(contac: any, i: any){
    this.contactoEditando = {
      id_contacto: contac.id_contacto,
      id_empresa: contac.id_empresa,
      id_tipo_contacto: contac.id_tipo_contacto,
      nombre_completo: contac.nombre_completo,
      descripcion: contac.descripcion,
      creado_por: contac.creado_por,
      fecha_creacion: contac.fecha_creacion, 
      modificado_por: this.usuario,
      fecha_modificacion: new Date(), 
      estado: contac.estado,

    };
    this.indice = i;
  }
  // Método para enviar una solicitud para insertar el registro en la base de datos
  insertarProducto(producto: any) {
    // Realizar una solicitud HTTP POST a la API para insertar el registro
    const productoAgregado = {
      id_empresa: this.idEmpresa,
      id_producto: producto.id_producto,
      descripcion: this.descripcionEmpresa,
      creado_por:  this.usuario,
      fecha_creacion: new Date(),
      modificado_por: this.usuario,
      fecha_modificacion: new Date(),
      estado: 1
    }
    this._empresasProductosService.agregarOperacionEmpresaProducto(productoAgregado).subscribe({
      next: (data: any) =>{
        this._toastr.success('Productos actualizados');
        // Después de agregar el nuevo producto a la base de datos
        // Llamar a los métodos para obtener los datos actualizados
        this.actualizarTabla();
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  eliminarProducto(producto: any) {
    // Realizar una solicitud HTTP DELETE a la API para eliminar el registro

    this._empresasProductosService.eliminarOperacionEmpresaProducto(producto.id_emp_prod).subscribe({
      next: (data: any) =>{
        this._toastr.success('Productos actualizados');
        // Llamar a los métodos para obtener los datos actualizados
        this.actualizarTabla();
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  EditarContactos() {
    const contactosMarcados = this.listNuevosContactos.filter(contacto => contacto.posee_contacto);
    const contactosDesmarcados = this.listNuevosContactos.filter(contacto => !contacto.posee_contacto);
    contactosMarcados.forEach(contacto => {
      if (!contacto.id_empresa) {
        // Si el producto no tiene un ID de empresa, significa que no estaba registrado anteriormente,
        // así que debemos insertarlo en la base de datos.
        this.insertarContacto(contacto);
      }
    });
  
    contactosDesmarcados.forEach(contacto => {
      if (contacto.id_empresa) {
        // Si el producto tenía un ID de empresa (estaba activo anteriormente),
        // entonces debemos eliminarlo de la base de datos.
        this.eliminarContacto(contacto);
      }
    });
  }

  // Método para enviar una solicitud para insertar el registro en la base de datos
  insertarContacto(contacto: any) {
    // Realizar una solicitud HTTP POST a la API para insertar el registro
    const contactoAgregado = {
      id_empresa: this.idEmpresa,
      id_contacto: contacto.id_contacto,
      descripcion: this.descripcionEmpresa,
      creado_por:  this.usuario,
      fecha_creacion: new Date(),
      modificado_por: this.usuario,
      fecha_modificacion: new Date(),
      estado: 1
    }
    this._empresasContactosService.agregarOperacionEmpresaContacto(contactoAgregado).subscribe({
      next: (data: any) =>{
        this._toastr.success('Contactos actualizados');
        // Después de agregar el nuevo producto a la base de datos
        // Llamar a los métodos para obtener los datos actualizados
        this.actualizarTabla();
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  tipoContactoSeleccionado(event: Event): void {
    const idTipoEmpresa = (event.target as HTMLSelectElement).value;
    this.contactoEditando.id_tipo_contacto = Number(idTipoEmpresa);
  }
  editarContacto(){
    this._contactoService.editarContacto(this.contactoEditando).subscribe({
      next: (data) => {
        //this.listContacto[this.indice].tipo_contacto =
        this._toastr.success('contacto editado con éxito');
        this.actualizarTabla();
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });

  }

  eliminarContacto(contacto: any) {
    // Realizar una solicitud HTTP DELETE a la API para eliminar el registro
    this._empresasContactosService.eliminarOperacionEmpresaContacto(contacto.id_emp_contactos).subscribe({
      next: (data: any) =>{
        this._toastr.success('Contactos actualizados');
        // Llamar a los métodos para obtener los datos actualizados
        this.actualizarTabla();
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  actualizarTabla() {
    // Llamar a los métodos para obtener los datos actualizados
    this.getEmpresasProductosPorId();
    this.getProductosNoRegistradosPorId();
    this.getEmpresasContactosPorId();
    this.getContactosNoRegistradosPorId();
  }
  eliminarCaracteresEspeciales(event: any, field: string) {
    setTimeout(() => {
      let inputValue = event.target.value;
  
      // Elimina caracteres especiales dependiendo del campo
      if (field === 'producto') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Solo permite letras y números y espacios en blanco
      }else if (field === 'descripcion') {
        inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Solo permite letras, números y espacios en blanco
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
  toggleFunction(contac: any, i: number) {

    // Ejecuta una función u otra según el estado
    if (contac.estado == 1 ) {
      this.inactivarContacto(contac, i); // Ejecuta la primera función
    } else {
      this.activarContacto(contac, i); // Ejecuta la segunda función
    }
  }
  inactivarContacto(contacto: Contacto, i: any){
    const inactivarC: Contacto = {
      id_contacto: contacto.id_contacto,
      id_empresa: contacto.id_empresa,
      id_tipo_contacto: contacto.id_tipo_contacto,
      nombre_completo: contacto.nombre_completo,
      descripcion: contacto.descripcion,
      creado_por: contacto.creado_por,
      fecha_creacion: contacto.fecha_creacion, 
      modificado_por: contacto.modificado_por,
      fecha_modificacion: contacto.fecha_modificacion, 
      estado: 2,
    };
    console.log(inactivarC);
    this._contactoService.inactivarContacto(inactivarC).subscribe(data => {
    this._toastr.success('El contacto: '+ contacto.nombre_completo + ' ha sido inactivado');
    //this.inactivarBitacora(data);
  });
    this.productosContactos[i].estado = 2; 
  }
  activarContacto(contacto: Contacto, i: any){
    const activarC: Contacto = {
      id_contacto: contacto.id_contacto,
      id_empresa: contacto.id_empresa,
      id_tipo_contacto: contacto.id_tipo_contacto,
      nombre_completo: contacto.nombre_completo,
      descripcion: contacto.descripcion,
      creado_por: contacto.creado_por,
      fecha_creacion: contacto.fecha_creacion, 
      modificado_por: contacto.modificado_por,
      fecha_modificacion: contacto.fecha_modificacion, 
      estado: 1,
    };
    console.log(activarC);
    this._contactoService.activarContacto(activarC).subscribe(data => {
    this._toastr.success('El contacto: '+ contacto.nombre_completo + ' ha sido activado');
    //this.activarBitacora(data);
  });
    this.productosContactos[i].estado = 1;
  }

}
