import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../../services/empresa/empresa.service'
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { Pyme } from 'src/app/interfaces/pyme/pyme';

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

  constructor(
    private empresaService: EmpresaService,
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
    private pymesService: PymeService) {}

  ngOnInit() {
    this.actualizarConteousuarios();
    this.actualizarConteoProductos();
    this.actualizarConteoEmpresas();
    this.actualizarConteoPymes();
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