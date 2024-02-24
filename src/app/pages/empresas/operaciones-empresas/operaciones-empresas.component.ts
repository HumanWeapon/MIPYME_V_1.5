import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { data } from 'jquery';
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

  //Obtiene los productos activos de la Empresa y los muestra en la tabla.
  productosEmpresa: any[] = [];

  //Obtiene la información del buscador de mi tabla productos
  filtro: string = '';
  todosLosProductos: any[] = [];

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
    if(EmpresaNombre && EmpresaDescripcion && EmpresaId){
      this.idEmpresa = EmpresaId;
      this.nombreEmpresa = EmpresaNombre;
      this.descripcionEmpresa = EmpresaDescripcion;
    }
    this.getEmpresasProductosPorId();
  }

  constructor(
    private toastr: ToastrService,
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
  
  getEmpresasProductos() {
    this._empresasProductosService.consultarOperacionesEmpresasProductos().subscribe({
      next: (data: any) => {
        this.productosEmpresa = data;
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
        console.log(data)
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

}
