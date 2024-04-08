import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { da } from 'date-fns/locale';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ContactoTelefono } from 'src/app/interfaces/contacto/contactoTelefono';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ContactoService } from 'src/app/services/contacto/contacto.service';
import { ContactoTService } from 'src/app/services/contacto/contactoTelefono.service';
import { DireccionesService } from 'src/app/services/contacto/direcciones.service';
import { EmpresaService } from 'src/app/services/empresa/empresa.service';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { ErrorService } from 'src/app/services/error.service';
import { CategoriaService } from 'src/app/services/mantenimiento/categoria.service';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { TipoContactoService } from 'src/app/services/mantenimiento/tipoContacto.service';
import { TipoDireccionService } from 'src/app/services/mantenimiento/tipoDireccion.service';
import { TipoRequisitoService } from 'src/app/services/mantenimiento/tipoRequisito.service';
import { EmpresasContactosService } from 'src/app/services/operaciones/empresas-contactos.service';
import { EmpresasDireccionesService } from 'src/app/services/operaciones/empresas-direcciones.service';
import { EmpresasProdcutosService } from 'src/app/services/operaciones/empresas-prodcutos.service';
import { HistoriaBusquedaService } from 'src/app/services/pyme/historia-busqueda.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  
  // Variables obtenidas del Local Store, Información de la Empresa.
  idEmpresa: any;
  idContacto: any;
  nombreEmpresa: string = '';
  descripcionEmpresa: string = '';
  searchTerm: string = '';
  categoria: string = '';
  pais: string = '';
  id_pais: number = 0;
  id_producto: number = 0;
  id_pyme: number = 0;
  ciudad: string = '';

  //arrays
  list_productos: any[]=[];
  list_categorias: any[]=[];
  list_paises: any[]=[]; //modal paises
  list_empresas: any[]=[]; //modal empresas
  productosEmpresa: any[] = [];//Obtiene los productos registrados de la Empresa y los muestra en la tabla.
  productosContactos: any[] = [];//Obtiene los contactos registrados de la Empresa y los muestra en la tabla.
  direccionesEmpresa: any[] = [];//Obtiene los contactos registrados de la Empresa y los muestra en la tabla.
  contactosActivos: any[] = []; //Obtiene los contactos activos de la Empresa y los muestra en la tabla.
  telefonosContactos: any[] = [];//Obtiene los telefonos registrados para cada contacto.
  requisitosAllPaisesEmpresas: any[] = [];//Obtiene los requisitos registrados de la Empresa y los muestra en la tabla.
  //filtros
  filtro_pais: string = '';//modal paises
  filtro_empresa: string = '';//modal empresas
  paisesEmpresa: any[] = [];//modal paises
  empresasEmpresa: any[] = [];//modal empresas
  todosLosPaises: any[] = []; //modal paises
  todasLasEmpresas: any[] = []; //modal empresas
  //filtros modales
  filtro_prod: string = '';
  filtro_contact: string = '';
  filtro_telefono: string = '';
  filtro_direc: string = '';
  todosLosProductos: any[] = [];
  todosLosContactos: any[] = [];
  todosLosTelefonos: any[] = [];
  todasLasDirecciones: any[] = [];
  todosLosRequisitos: any[] = [];
  filtroModalProd: string = '';
  filtroModalCont: string = '';

  list_productosFilter: any[]=[]; //lista de productos
  //paginación
  p: number = 1;

  constructor(
    private _toastr: ToastrService,
    private _errorService: ErrorService,
    private _opEmpresasProductos: EmpresasProdcutosService,
    private _empresasContactosService: EmpresasContactosService,
    private _empresasDireccionesService: EmpresasDireccionesService,
    private _telefonosService: ContactoTService,
    private _tipoRequisitoService: TipoRequisitoService, 
    private _historialB: HistoriaBusquedaService,
    private _pymeService: PymeService
  ){}

  ngOnInit(): void {
    this.getOpProductos();
    this.getIdPyme();
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
  getEmpresa(empresa: any) {
    this.idEmpresa = empresa.id_empresa;
    this.nombreEmpresa = empresa.nombre_empresa;
    console.log(empresa);
    this.getEmpresasContactosPorId();
    this.getDireccionesEmpresaporID();
    this.getRequisitosEmpresaPorId();
    if(this.id_pyme){
      this.postHistorialBusqueda();
    }
    
  }
  getIdPyme(){
    const idPYME = localStorage.getItem('nombre_pyme');
    if(idPYME){
      this._pymeService.getOnePyme(idPYME).subscribe({
        next: (data) => {
          console.log(data);
          this.id_pyme = data.id_pyme;
        },
        error: (e: HttpErrorResponse) => {
          this._errorService.msjError(e);
        }
      });
    }
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
    //Obtiene todos los contactos registrados a una empresa
  getEmpresasContactosPorId() {
    this._empresasContactosService.consultarContactosPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.productosContactos = data;
        this.todosLosContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  //Obtiene todos los contactos registrados a una empresa
  getDireccionesEmpresaporID() {
    this._empresasDireccionesService.consultarDireccionesPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.direccionesEmpresa = data;
        this.todasLasDirecciones = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
  //Obtiene todos los Requisitos registrados a una empresa
  getRequisitosEmpresaPorId() {
    this._tipoRequisitoService.consultarRequisitosPorId(this.idEmpresa).subscribe({
      next: (data: any) => {
        this.requisitosAllPaisesEmpresas = data;
        console.log('Datos recibidos:', data); // Agregar console.log aquí
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
  //busca los productos de la tabla principal de los contactos
  buscarContactos() {
    if (this.filtro_contact.trim() === '') {
      this.productosContactos = this.todosLosContactos; // Si el filtro está vacío, muestra todos los productos
    } else {
      this.productosContactos = this.todosLosContactos.filter(contacto => {
        // Filtrar por el nombre del producto
        return contacto.nombre_completo.toLowerCase().includes(this.filtro_contact.trim().toLowerCase());
      });
    }
  }
  buscarTelefonos(id_contacto: any){
    // Asignar el id_contacto a la variable de clase
  this.idContacto = id_contacto;
    this._telefonosService.telefonosdeContactosPorId(id_contacto).subscribe({
      next: (data) =>{
        this.telefonosContactos = data;
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    });
  }
    //busca las direcciones de la tabla principal de los direcciones
    buscarDirecciones() {
      if (this.filtro_direc.trim() === '') {
        this.direccionesEmpresa = this.todasLasDirecciones; // Si el filtro está vacío, muestra todos los productos
      } else {
        this.direccionesEmpresa = this.todasLasDirecciones.filter(direccion => {
          // Filtrar por el nombre del producto
          return direccion.direccion.toLowerCase().includes(this.filtro_direc.trim().toLowerCase());
        });
      }
    }

    formatPhoneNumber(phoneNumber: string | null): string {
      if (phoneNumber === null || phoneNumber === undefined) {
          return ''; // Retorna una cadena vacía si phoneNumber es null o undefined
      }
  
      // Eliminar caracteres que no sean números
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      
      // Separar el número cada cuatro dígitos con el signo "-"
      const formattedNumber = cleanedNumber.match(/.{1,4}/g)?.join('-') || ''; // Usa el operador de opción segura (?.) y el operador de fusión nula (||)
      
      return formattedNumber;
  }
  postHistorialBusqueda(){
    const historialBusqueda = {
      id_historial: 0,
      id_pyme: this.id_pyme, 
      id_producto: this.id_producto, 
      id_pais: this.id_pais, 
      id_empresa: this.idEmpresa, 
      descripcion: "BUSQUEDA DE PYME", 
      creado_por: "APLICACION", 
      fecha_creacion: new Date().getUTCDay, 
      modificado_por: "APLICACION", 
      fecha_modificacion: new Date().getUTCDay, 
      estado: 1
    }
    console.log(historialBusqueda);
    this._historialB.postHistorialB(historialBusqueda).subscribe({
      next: (data) => {
        
      },
      error: (e: HttpErrorResponse) => {
        this._errorService.msjError(e);
      }
    })
  }
}
