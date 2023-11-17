import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { HttpErrorResponse } from '@angular/common/http';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { TipoEmpresaService  } from 'src/app/services/mantenimiento/tipoEmpresa.service';
import { TipoEmpresa } from 'src/app/interfaces/mantenimiento/tipoEmpresa';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  _listPaises: Paises[] = [];
  _listCategorias: Categoria[] = [];
  data: any;

  constructor(
    private _objService: ProductosService, 
    private toastr: ToastrService,
    private _bitacoraService: BitacoraService,
    private _errorService: ErrorService,
    private _tipoEmpresa: TipoEmpresaService,
    private ngZone: NgZone,
    private _categoriaProductos: CategoriaService,
    private _paisesService: PaisesService
    ) {}


    ngOnInit(): void {
      this._categoriaProductos.getAllCategorias().subscribe(
        (data: Categoria[]) => {
          this._listCategorias = data.sort((a, b) => a.categoria.localeCompare(b.categoria));
          console.log(this._listCategorias);
        },
        (error: HttpErrorResponse) => {
          console.error('Error al obtener categorías:', error);
          this.toastr.error('Error al obtener categorías', 'Error');
        }
      );
    
      this._paisesService.getAllPaises().subscribe(
        (data: Paises[]) => {
          this._listPaises = data.sort((a, b) => a.pais.localeCompare(b.pais));
          console.log(this._listPaises);
        },
        (error: HttpErrorResponse) => {
          console.error('Error al obtener países:', error);
          this.toastr.error('Error al obtener países', 'Error');
        }
      );
    }
    

    

}
