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
  categoria: string = ''
  ciudad: string = ''
  pais: string = ''

  list_productos: any[]=[];
  list_productosFilter: any[]=[];
  list_categorias: any[]=[];
  list_paises: any[]=[];
  list_ciudades: any[]=[];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  
  constructor(
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private _opEmpresasProductos: EmpresasProdcutosService,
  ){}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
      searching: false
    };
    this.getOpProductos();
  };
  

  getOpProductos(){
    this._opEmpresasProductos.getProductosSearch().subscribe({
      next: (data) => {
        this.list_productos = data;
        this.list_productosFilter = data;
        this.dtTrigger.next(null);
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
