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
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-operaciones-empresas',
  templateUrl: './operaciones-empresas.component.html',
  styleUrls: ['./operaciones-empresas.component.css']
})
export class OperacionesEmpresasComponent {

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
  }

  constructor(
    private toastr: ToastrService,
    private _errorService: ErrorService,
    private _router: Router,
    private _empresaService: EmpresaService,
    private _bitacoraService: BitacoraService,
    private _userService: UsuariosService,
    private _productoService: ProductosService,
    /*private _paisesService: PaisesService,
    
    private _direccionService: DireccionesService,
    private _telefonoService: ContactoTService,
    private _tipoDireccionService: TipoDireccionService,
    private _tipoCategoriaService: CategoriaService,
    private _contactoService: ContactoService,*/
  ) {}

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
      console.log(this.nuevaEmpresa)
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
    this._productoService.getAllProductos().subscribe({
      next: (data: any) => {
        this.listProductos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }

  agregarProducto(){
    //this.operaciones_empresas.id_producto = this.listProductos.id_producto;
    console.log(this.nuevoProducto);
  };
  agregarDireccion(){}
  
  agregarTelefono(){};

  agregarTodo() {
    this.agregarEmpresa();
  }

}
