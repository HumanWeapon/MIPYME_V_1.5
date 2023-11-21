import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  
  dtOptions: DataTables.Settings = {};
  _listCategorias: Categoria[] = [];
  _listProductos: Productos[] = [];
  productosFiltrados: Productos[] = [];
  opcionSeleccionada: number = 0;
  dtTrigger: Subject<any> = new Subject<any>();
  searchTerm: string = '';

  constructor(
    private _productoService: ProductosService,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private _categoriaProductos: CategoriaService,
  ) {}

  ngOnInit(): void {
    this.getCategorias();
    this.getProductos();
  }

  ngOnDestroy(): void {
    // No olvides desuscribir el evento
    this.dtTrigger.unsubscribe();
  }

  getCategorias() {
    this._categoriaProductos.getAllCategorias()
      .subscribe({
        next: (data) => {
          // Encontrar la categoría "Todos los productos"
          const todosLosProductos = data.find(categoria => categoria.categoria.toLowerCase() === 'todos los productos');
  
          // Filtrar las categorías excluyendo la que tiene el nombre "Todos los productos"
          const otrasCategorias = data.filter(categoria => categoria.categoria.toLowerCase() !== 'todos los productos');
  
          // Verificar si se encontró la categoría "Todos los productos" antes de asignarla
          if (todosLosProductos) {
            // Ordenar el arreglo de categorías para que la categoría "Todos los productos" esté al principio
            this._listCategorias = [todosLosProductos, ...otrasCategorias];
          } else {
            // Manejar el caso en que no se encuentra la categoría "Todos los productos"
            console.error('Error: No se encontró la categoría "Todos los productos".');
            // Puedes asignar un valor predeterminado o manejarlo de otra manera según tus necesidades
          }
  
          this.dtTrigger.next(0);
        }
      });
  }
  

  getProductos() {
    this._productoService.getAllProductos()
      .subscribe({
        next: (data) => {
          this._listProductos = data;
          this.dtTrigger.next(0);
        }
      });
  }

  filtrarProductosPorCategoria() {
    // Filtrar los productos basados en la categoría seleccionada
    if (this.opcionSeleccionada !== 0) {
      this.productosFiltrados = this._listProductos.filter(producto => producto.id_categoria === this.opcionSeleccionada);
    } else {
      // Si la opción seleccionada es 0, mostrar todos los productos
      this.productosFiltrados = this._listProductos;
    }
  }

  filtrarProductosPorTermino() {
    // Filtrar productos basados en el término ingresado por el usuario
    const searchTerm = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';
  
    if (searchTerm !== '') {
      this.productosFiltrados = this._listProductos.filter(producto => 
        producto.producto.toLowerCase().includes(searchTerm)
      );
    } else {
      // Si el campo de búsqueda está vacío, mostrar todos los productos
      this.productosFiltrados = this._listProductos;
    }
  }

  filtrarProductos() {
    const searchTerm = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';

      // Agrega console logs para verificar los valores
  console.log('Opción seleccionada:', this.opcionSeleccionada);
  console.log('Término de búsqueda:', searchTerm);
    
    if (this.opcionSeleccionada === 20) {
      // Mostrar todos los productos y filtrar por término de búsqueda
      this.productosFiltrados = this._listProductos.filter(producto =>
        producto.producto.toLowerCase().includes(searchTerm)
      );
    } else {
      // Filtrar por categoría y término de búsqueda
      this.productosFiltrados = this._listProductos.filter(producto =>
        (this.opcionSeleccionada === 0 || producto.id_categoria === this.opcionSeleccionada) &&
        producto.producto.toLowerCase().includes(searchTerm)
      );
    }
    
  // Agrega un console log para verificar los productos filtrados
  console.log('Productos filtrados:', this.productosFiltrados);
  }
  






  
}





