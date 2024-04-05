import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { da } from 'date-fns/locale';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ErrorService } from 'src/app/services/error.service';
import { EmpresasProdcutosService } from 'src/app/services/operaciones/empresas-prodcutos.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  
  searchTerm: string = '';
  categoria: string = '';
  pais: string = '';
  id_pais: number = 0;
  id_producto: number = 0;
  ciudad: string = '';

  //arrays
  list_productos: any[]=[];
  list_categorias: any[]=[];
  list_paises: any[]=[]; //modal paises
  list_empresas: any[]=[]; //modal empresas
  //filtros
  filtro_pais: string = '';//modal paises
  filtro_empresa: string = '';//modal empresas
  paisesEmpresa: any[] = [];//modal paises
  empresasEmpresa: any[] = [];//modal empresas
  todosLosPaises: any[] = []; //modal paises
  todasLasEmpresas: any[] = []; //modal empresas

  list_productosFilter: any[]=[]; //lista de productos
  //paginación
  p: number = 1;

  constructor(
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private _opEmpresasProductos: EmpresasProdcutosService,
  ){}

  ngOnInit(): void {
    this.getOpProductos();
  };

  onCategoriaChange(event: any) {
    this.categoria = event.target.value;
    if(this.categoria == 'Todo'){
      this.categoria = ''
    }
    this.getOpProductos();
  }
  
  onPaisChange(event: any) {
    this.pais = event.target.value;
    if(this.pais == 'Todo'){
      this.pais = ''
    }
    this.getOpProductos();
  }
  getIdProducto(id_producto: any) {
    this.id_producto = id_producto;
    this.getPaisesPorProducto();
  }
  getIdPais(id_pais: any) {
    this.id_pais = id_pais;
    this.getPaisesPorProducto();
  }

  //obtiene los productos mostrados en la lista principal
  getOpProductos(){
    this._opEmpresasProductos.getProductosSearch(this.categoria, this.pais).subscribe({
      next: (data) => {
        this.list_productos = data;
        this.list_productosFilter = data;
        this.filterProductos(); // Aplicar filtro inicialmente
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  //obtiene los paises por el id del producto
  getPaisesPorProducto() {
    this._opEmpresasProductos.getPaisesPorProducto(this.id_producto).subscribe({
      next: (data: any) => {
        this.list_paises = data;
        this.todosLosPaises = data;
        this.buscarPais();
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
    //obtiene las empresas por el id del pais
    getPaisesEmpresasPorPais() {
      this._opEmpresasProductos.getPaisesEmpresasPorPais(this.id_pais, this.id_producto).subscribe({
        next: (data: any) => {
          this.list_empresas = data;
          this.todasLasEmpresas = data;
          this.buscarEmpresa();
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }

  filterProductos(){
    if (this.searchTerm.trim() === '') {
      this.list_productosFilter = this.list_productos; // Restaurar lista filtrada
    } else {
      this.list_productosFilter = this.list_productos.filter(producto => {
        // Filtrar por el nombre del producto
        return producto.producto.toLowerCase().includes(this.searchTerm.trim().toLowerCase());
      });
    }
  }
  buscarPais() {
    if (this.filtro_pais.trim() === '') {
      this.paisesEmpresa = this.todosLosPaises; // Si el filtro está vacío, muestra todos los paises
    } else {
      this.paisesEmpresa = this.todosLosPaises.filter(pais => {
        // Filtrar por el nombre del producto
        return pais.pais.toLowerCase().includes(this.filtro_pais.trim().toLowerCase());
      });
    }
  }
  buscarEmpresa() {
    if (this.filtro_empresa.trim() === '') {
      this.empresasEmpresa = this.todasLasEmpresas; // Si el filtro está vacío, muestra todos los paises
    } else {
      this.empresasEmpresa = this.todasLasEmpresas.filter(empresa => {
        // Filtrar por el nombre del producto
        return empresa.nombre_empresa.toLowerCase().includes(this.filtro_empresa.trim().toLowerCase());
      });
    }
  }
}
