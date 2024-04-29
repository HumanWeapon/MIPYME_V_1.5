import { Component, OnInit, ViewChild } from '@angular/core';
import { EmpresaService } from '../../services/empresa/empresa.service'
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { HistoriaBusquedaService } from 'src/app/services/pyme/historia-busqueda.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';
import { PermisosService } from 'src/app/services/seguridad/permisos.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalEmpresas: number = 0;
  totalPymes: number = 0;
  totalUsuarios: number = 0;
  totalProductos: number = 0;

  usuarios: Usuario[] = [];
  productos: Productos[] = [];
  pymes: Pyme[] = [];
  empresas: Empresa[] = [];

  consultar: boolean = false;
  insertar: boolean = false;
  actualizar: boolean = false;
  eliminar: boolean = false;

  constructor(
    private empresaService: EmpresaService,
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
    private pymesService: PymeService,
    private _historialService: HistoriaBusquedaService,
    private _errorService: ErrorService,
    private _permisosService: PermisosService

  ) {

  }

  ngOnInit() {
    this.getPermnisosObjetos();
    this.actualizarConteousuarios();
    this.actualizarConteoProductos();
    this.actualizarConteoEmpresas();
    this.actualizarConteoPymes();
    this.getTop10Busquedas();
  }



 /***********************CONTEO EMPRESAS***************************/

getTop10Busquedas(){
  this._historialService.getTop10Busquedas().subscribe({
    next: (data) => {
      
      console.log(data);
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  })
}
/******************************************************************/

getPermnisosObjetos(){
  const idObjeto = localStorage.getItem('id_objeto');
  const idRol = localStorage.getItem('id_rol');
  if(idObjeto && idRol){
    this._permisosService.getPermnisosObjetos(idRol, idObjeto).subscribe({
      next: (data: any) => {
        console.log(data)
        this.consultar = data.permiso_consultar;
        this.insertar = data.permiso_insercion;
        this.actualizar = data.permiso_actualizacion;
        this.eliminar = data.permiso_eliminacion;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
}

/***********************CONTEO EMPRESAS***************************/
  private actualizarConteoEmpresas() {
    this.empresaService.getAllEmpresas().subscribe(
      empresas => {
        this.totalEmpresas = empresas.length;
      },
      error => {
        console.error('Error al obtener empresas:', error);
      }
    );
  }
/***********************FIN CONTEO EMPRESAS***************************/

/***********************CONTEO PYMES***************************/
private actualizarConteoPymes() {
  this.pymesService.getAllPymes().subscribe(
    pymes => {
      this.totalPymes = pymes.length;
    },
    error => {
      console.error('Error al obtener pymes:', error);
    }
  );
}
/***********************FIN CONTEO PYMES***************************/

/***********************CONTEO USUARIOS***************************/
private actualizarConteousuarios() {
  this.usuariosService.getAllUsuarios().subscribe(
    usuario => {
      this.totalUsuarios = usuario.length;
    },
    error => {
      console.error('Error al obtener usuarios:', error);
    }
  );
}
/***********************FIN CONTEO USUARIOS***************************/

/***********************CONTEO USUARIOS***************************/
private actualizarConteoProductos() {
  this.productosService.getAllProductos().subscribe(
    producto => {
      this.totalProductos = producto.length;
    },
    error => {
      console.error('Error al obtener productos:', error);
    }
  );
}
/***********************FIN CONTEO USUARIOS***************************/

}