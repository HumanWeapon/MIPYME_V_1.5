import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  ciudad: string = '';

  list_productos: any[]=[];
  list_productosFilter: any[]=[];
  list_categorias: any[]=[];
  list_paises: any[]=[];
  list_ciudades: any[]=[];

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


  

}
