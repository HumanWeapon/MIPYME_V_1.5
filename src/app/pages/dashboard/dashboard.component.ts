import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../../services/empresa/empresa.service'
import { Empresa } from 'src/app/interfaces/empresa/empresas';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';
import { Productos } from 'src/app/interfaces/mantenimiento/productos';
import { ProductosService } from 'src/app/services/mantenimiento/producto.service';
import { PymeService } from 'src/app/services/pyme/pyme.service';
import { Pyme } from 'src/app/interfaces/pyme/pyme';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { HistoriaBusquedaService } from 'src/app/services/pyme/historia-busqueda.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';
import { da } from 'date-fns/locale';


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
  

  single:any = [];
  view: [number, number] = [700, 400];
  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = false;
  showLegend: boolean = true;
  legendLabel: string = 'Color';
  showXAxisLabel: boolean = true;
  yAxisLabel: string = 'Producto';
  showYAxisLabel: boolean = true;
  xAxisLabel: string = 'Popularidad';

  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    name: 'producto',
    selectable: false,
    group: ScaleType.Ordinal,
  };
  

  constructor(
    private empresaService: EmpresaService,
    private usuariosService: UsuariosService,
    private productosService: ProductosService,
    private pymesService: PymeService,
    private _historialService: HistoriaBusquedaService,
    private _errorService: ErrorService
  ) {

    }

  ngOnInit() {
    this.actualizarConteousuarios();
    this.actualizarConteoProductos();
    this.actualizarConteoEmpresas();
    this.actualizarConteoPymes();
    this.getTop10Busquedas();
  }



 /***********************CONTEO EMPRESAS***************************/
 onSelect(data: any): void {
  console.log('Item clicked', JSON.parse(JSON.stringify(data)));
}

onActivate(data: any): void {
  console.log('Activate', JSON.parse(JSON.stringify(data)));
}

onDeactivate(data: any): void {
  console.log('Deactivate', JSON.parse(JSON.stringify(data)));
}
getTop10Busquedas(){
  this._historialService.getTop10Busquedas().subscribe({
    next: (data) => {
      this.single = data
      console.log(data);
      console.log(this.single);
    },
    error: (e: HttpErrorResponse) => {
      this._errorService.msjError(e);
    }
  })
}
/******************************************************************/


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