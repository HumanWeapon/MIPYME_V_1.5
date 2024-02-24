import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { da } from 'date-fns/locale';
import { data, error } from 'jquery';
import { ToastrService } from 'ngx-toastr';
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
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

  //Obtiene los productos activos de la Empresa y los muestra en la tabla.
  productosEmpresa: any[] = [];
  
  //Obtiene los productos no registrados para la empresa y mostrarlos en el modal de agregar productos.
  listNuevosProductos: any[] = []; //guarda los registros de mi consulta a la api
  listEditandoProductos: any[] = []; //Guardan la misma información, luego se comparan 
  posee_producto = true;

  //Obtiene la información del buscador de mi tabla productos
  filtro: string = '';
  todosLosProductos: any[] = [];
  filtroModal: string = '';

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

  ngOnInit(){
    this.getProductos();
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
  }

  constructor(
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private _router: Router,
    private _empresaService: EmpresaService,
    private _bitacoraService: BitacoraService,
    private _userService: UsuariosService,
    private _productoService: ProductosService,
    private _empresasProductosService: EmpresasProdcutosService
  ) {}

  buscarProductos() {
    if (this.filtro.trim() === '') {
      this.productosEmpresa = this.todosLosProductos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.productosEmpresa = this.todosLosProductos.filter(producto => {
        // Filtrar por el nombre del producto
        return producto.producto.producto.toLowerCase().includes(this.filtro.trim().toLowerCase());
      });
    }
  }
  buscarProductosModal() {
    if (this.filtroModal.trim() === '') {
      this.listNuevosProductos = this.listEditandoProductos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.listNuevosProductos = this.listEditandoProductos.filter(producto => {
        // Filtrar por el nombre del producto
        return producto.producto.toLowerCase().includes(this.filtroModal.trim().toLowerCase());
      });
    }
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
  marcarProducto(producto: any) {
    producto.posee_producto = true; // Marcar el producto
  }
  
  desmarcarProducto(producto: any) {
    producto.posee_producto = false; // Desmarcar el producto
  }
  guardarCambios() {
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
        this._toastr.success('Producto agregado exitosamente');
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
        this._toastr.success('Producto eliminado exitosamente');
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
  }
}
