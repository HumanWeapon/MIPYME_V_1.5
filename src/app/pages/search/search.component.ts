import { Component, NgZone, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { Categoria } from 'src/app/interfaces/mantenimiento/categoria';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Contacto } from 'src/app/interfaces/contacto/contacto';
import { ContactoDirecciones } from 'src/app/interfaces/contacto/contactoDirecciones';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { DireccionesService } from 'src/app/services/contacto/direcciones.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { Paises } from 'src/app/interfaces/empresa/paises';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {

  productoEditando: Productos = {
    id_producto: 0, 
    id_categoria: 0,
    id_contacto: 0,
    id_pais: 0, 
    producto:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };

  contactoEditando: Contacto = {
    id_contacto: 0,
    id_tipo_contacto: 0,
    dni: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo: '',
    descripcion: '',
    creado_por: '',
    fecha_creacion: new Date(), 
    modificado_por: '',
    fecha_modificacion:new Date(), 
    estado: 0,
  };

  paisEditando: Paises = {
    id_pais: 0, 
    id_contacto:0,
    pais:'', 
    descripcion: '', 
    creado_por: '', 
    fecha_creacion: new Date(), 
    modificado_por: '', 
    fecha_modificacion: new Date(), 
    estado: 0

  };
  
  //DATATABLE
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: DataTables.Settings = {};

  indice: any;

  _listCategorias: Categoria[] = [];
  _listContactos:Contacto[] = [];
  _listProductos: Productos[] = [];
  productosFiltrados: Productos[] = [];
  opcionSeleccionada: number = 0;
  opcionSeleccionadaPais: number = 0;
  searchTerm: string = '';
  categoriaSeleccionada: Categoria | null = null;
  _listPaises: Paises[] = [];

  //Lista de Vectores
  listOpProductos: any[] = [];
  listContactos: Contacto[] = [];
  listContactosDirecciones: ContactoDirecciones[] = [];
  listContactosTelefonos: ContactoTelefono[] = [];
  listPaises: Paises[] = [];

  //TITULO MODAL CONTACTOS
  producto: string = '';

  idOpProductos: number = 0;
  ngZone: any;
  noResultadosEncontrados: boolean = false;
  historialBusquedas: { termino: string, cantidad: number }[] = [];

  constructor(
    private _productoService: ProductosService,
    private toastr: ToastrService,
    private _ngZone: NgZone,
    private _categoriaProductos: CategoriaService,
    private _contactosService: ContactoService, 
    private _telefonosService: ContactoTService,
    private _direccionesService: DireccionesService,
    private _objService: PaisesService, 
    private _errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.getOpProductos();
    this.getCategorias();
    this.getProductos();
    this.getPais();
  }

  getOpProductos(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
      responsive: true,
    };
    this._productoService.getAllOpProductos()
      .subscribe((data: any) => {
        this.listOpProductos = data;
        this.dtTrigger.next(null);
      });
    }

    //Convercion de Letras
  Mayus1Letra(str: string): string {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /************************************************************************/
  //Obtencion de Todos las Combinaciones
  getContactos(id: string){
    this._contactosService.getContactoID(id).subscribe({
      next: (data: any) => {
        this.listContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  getDirecciones(id_contacto: any){
    this._direccionesService.getDireccion(id_contacto).subscribe({
      next: (data: any) => {
        this.listContactosDirecciones = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  getTelefonos(id_contacto: any){
    this._telefonosService.getTelefonos(id_contacto).subscribe({
      next: (data: any) => {
        this.listContactosTelefonos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  getPaises(id_contacto: any){
    this._objService.getPaises(id_contacto).subscribe({
      next: (data: any) => {
        this.listPaises = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  /***************************************************************************/


  /***************************************************************************/
  //Obtencion de Combinaciones para obtener todos los datos por Id
  obtenerIdOpProducto(dni: any, producto: any, id_contacto:any) {
    console.log(id_contacto);
    this.getContactos(dni);
    this.producto = producto;
    this.getDirecciones(id_contacto);
    this.getTelefonos(id_contacto);
   // this.getPaises(id_contacto);
  }

  obtenerIdContacto(contac: Contacto, i: any){
    this.contactoEditando = {
      id_contacto: contac.id_contacto,
      id_tipo_contacto: contac.id_tipo_contacto,
      dni: contac.dni,
      primer_nombre: contac.primer_nombre,
      segundo_nombre: contac.segundo_nombre,
      primer_apellido: contac.primer_apellido,
      segundo_apellido: contac.segundo_nombre,
      correo: contac.correo,
      descripcion: contac.descripcion,
      creado_por: contac.creado_por,
      fecha_creacion: contac.fecha_creacion, 
      modificado_por: contac.modificado_por,
      fecha_modificacion: contac.fecha_modificacion, 
      estado: contac.estado,

    };
    this.indice = i;
  }

  /***********************************************************************/
  //Obtencion de Datos
  getPais(){
    this._objService.getAllPaises()
      .subscribe({
        next: (data) => {
          // Encontrar la categoría "Todos los productos"
          const todosLosPaises = data.find(pais => pais.pais.toLowerCase() === 'all');
  
          // Filtrar las categorías excluyendo la que tiene el nombre "Todos los productos"
          const otrosPaises = data.filter(pais => pais.pais.toLowerCase() !== 'all');
  
          // Verificar si se encontró la categoría "Todos los productos" antes de asignarla
          if (todosLosPaises) {
            // Ordenar el arreglo de categorías para que la categoría "Todos los productos" esté al principio
            this._listPaises = [todosLosPaises, ...otrosPaises];
          } else {
            // Manejar el caso en que no se encuentra la categoría "Todos los productos"
            console.error('Error: No se encontró la categoría "Todos los productos".');
            // Puedes asignar un valor predeterminado o manejarlo de otra manera según tus necesidades
          }
  
          this.dtTrigger.next(0);
        }
      });
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
    this._productoService.getAllOpProductos()
      .subscribe({
        next: (data) => {
          this._listProductos = data;
          this.dtTrigger.next(0);
        }
      });
  }
  /************************************************************************/
  
  /************************************************************************/
  //Filtros de Busquedas
  filtrarProductosPorCategoria() {
    // Resetear la categoría y país seleccionados
    this.categoriaSeleccionada = null;
  
    if (this.opcionSeleccionada === 20) {
      // Si la opción seleccionada es 20, mostrar todos los productos
      this.listOpProductos = this._listProductos.filter(producto =>
        (this.opcionSeleccionadaPais === 99 || producto.id_pais === this.opcionSeleccionadaPais)
      );
    } else {
      // Filtrar por la categoría y país seleccionados
      this.categoriaSeleccionada = this._listCategorias.find(categoria => categoria.id_categoria === this.opcionSeleccionada) || null;
  
      this.listOpProductos = this._listProductos.filter(producto =>
        (this.opcionSeleccionada === 0 || producto.id_categoria === this.opcionSeleccionada) &&
        (this.opcionSeleccionadaPais === 0 || producto.id_pais === this.opcionSeleccionadaPais)
      );
    }
  }
  
  
  filtrarProductosPorTermino() {
    // Filtrar productos basados en el término ingresado por el usuario
    const searchTerm = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';
  
    // Si el campo de búsqueda está vacío, mostrar todos los productos
    if (searchTerm === '') {
      this.listOpProductos = this._listProductos;
      this.noResultadosEncontrados = false;
      return;
    } else {
      this.listOpProductos = this._listProductos.filter(producto =>
        producto.producto.toLowerCase().includes(searchTerm) &&
        ((this.opcionSeleccionada === 0 && this.opcionSeleccionadaPais === 0) ||
          (this.opcionSeleccionada !== 0 && this.opcionSeleccionadaPais === 0 && producto.id_categoria === this.opcionSeleccionada) ||
          (this.opcionSeleccionada === 0 && this.opcionSeleccionadaPais !== 0 && producto.id_pais === this.opcionSeleccionadaPais) ||
          (this.opcionSeleccionada !== 0 && this.opcionSeleccionadaPais !== 0 && producto.id_categoria === this.opcionSeleccionada && producto.id_pais === this.opcionSeleccionadaPais))
      );
    }
  
    // Verificar si no se encontraron resultados
    this.noResultadosEncontrados = this.listOpProductos.length === 0;
  }
  
  filtrarProductos() {
    const searchTerm = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';
    const idTodosLosProductos = this._listCategorias.find(categoria => categoria.categoria.toLowerCase() === 'todos los productos')?.id_categoria;
  
    if (this.opcionSeleccionadaPais === 99 && this.opcionSeleccionada === 20) {
      // Si la opción seleccionada de países es "All" y de categoría es "Todos los Productos",
      // mostrar todos los productos y aplicar filtro por término de búsqueda
      this.listOpProductos = this._listProductos.filter(producto =>
        producto.producto.toLowerCase().includes(searchTerm)
      );
    } else {
      // Filtrar por término de búsqueda, categoría y país
      this.listOpProductos = this._listProductos.filter(producto =>
        producto.producto.toLowerCase().includes(searchTerm) &&
        ((this.opcionSeleccionada === 0 || this.opcionSeleccionada === idTodosLosProductos) || producto.id_categoria === this.opcionSeleccionada) &&
        ((this.opcionSeleccionadaPais === 0) || producto.id_pais === this.opcionSeleccionadaPais)
      );
    }
  
    // Agrega un console log para verificar los productos filtrados
    console.log('Productos filtrados:', this.listOpProductos);
  }
  
  
}
  /********************************************************************************/
  





