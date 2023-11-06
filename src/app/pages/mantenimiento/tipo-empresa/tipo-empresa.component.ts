import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { TipoEmpresa } from 'src/app/interfaces/mantenimiento/tipoEmpresa';
import { TipoEmpresaService } from 'src/app/services/mantenimiento/tipoEmpresa.service';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-tipo-empresa',
  templateUrl:'./tipo-empresa.component.html',
  styleUrls: ['./tipo-empresa.component.css']
})
export class TipoEmpresaComponent implements OnInit{

    tipoEmpresaEditando: TipoEmpresa = {
      id_tipo_empresa: 0, 
      tipo_empresa: '', 
      descripcion:'',
      creado_por: '', 
      fecha_creacion: new Date(), 
      modificado_por: '', 
      fecha_modificacion: new Date(),
      estado: 0,
    };
    nuevoTipoEmpresa: TipoEmpresa = {
        id_tipo_empresa: 0, 
        tipo_empresa: '', 
        descripcion:'',
        creado_por: 'SYSTEM', 
        fecha_creacion: new Date(), 
        modificado_por: 'SYSTEM', 
        fecha_modificacion: new Date(),
        estado: 0,
    
      };
      indice: any;

  dtOptions: DataTables.Settings = {};
  listTipoE: TipoEmpresa[] = [];
  data: any;
  dtTrigger: Subject<any> = new Subject<any>();



  constructor(
    private tipoempresaService: TipoEmpresaService,    
    private toastr: ToastrService,
    private router: Router, 
    private ngZone: NgZone
    ) { }

    ngOnInit(): void {
        this.dtOptions = {
          pagingType: 'full_numbers',
          pageLength: 8,
          language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
          responsive: true
        };
        this.tipoempresaService.getAllTipoEmpresa()
          .subscribe((res: any) => {
            this.listTipoE = res;
            this.dtTrigger.next(null);
          });
      }
      ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
      }

      onInputChange(event: any, field: string) {
        if (field === 'tipo_empresa' || field === 'descripcion') {
          const inputValue = event.target.value;
          const uppercaseValue = inputValue.toUpperCase();
          event.target.value = uppercaseValue;
        }
      }
      
      inactivarTipoEmpresa(tipoEmpresa: TipoEmpresa, i: any){
        this.tipoempresaService.inactivarTipoEmpresa(tipoEmpresa).subscribe(data => this.toastr.success('El tipo de empresa: '+ tipoEmpresa.tipo_empresa + ' ha sido inactivado'));
        this.listTipoE[i].estado = 2; 
      }
      activarTipoEmpresa(tipoEmpresa: TipoEmpresa, i: any){
        this.tipoempresaService.activarTipoEmpresa(tipoEmpresa).subscribe(data => this.toastr.success('El tipo de empresa: '+ tipoEmpresa.tipo_empresa + ' ha sido activado'));
        this.listTipoE[i].estado = 1;
      }
    
      agregarNuevoTipoEmpresa() {
    
        this.nuevoTipoEmpresa = {
          id_tipo_empresa: 0, 
          tipo_empresa: this.nuevoTipoEmpresa.tipo_empresa, 
          descripcion:this.nuevoTipoEmpresa.descripcion,
          creado_por: 'SYSTEM', 
          fecha_creacion: new Date(), 
          modificado_por: 'SYSTEM', 
          fecha_modificacion: new Date(),
          estado: 1,
    
        };
    
        this.tipoempresaService.addTipoEmpresa(this.nuevoTipoEmpresa).subscribe(data => {
          this.toastr.success('Tipo de empresa agregado con éxito');
          
           // Recargar la página
           location.reload();
           // Actualizar la vista
           this.ngZone.run(() => {        
           });
        });
      }
    
    
      obtenerIdTipoEmpresa(tipoE: TipoEmpresa, i: any){
    
        this.tipoEmpresaEditando = {
          
        id_tipo_empresa: tipoE.id_tipo_empresa, 
        tipo_empresa: tipoE.tipo_empresa, 
        descripcion: tipoE.descripcion,
        creado_por: tipoE.creado_por, 
        fecha_creacion: tipoE.fecha_creacion, 
        modificado_por: tipoE.modificado_por, 
        fecha_modificacion: tipoE.fecha_modificacion,
        estado: tipoE.estado,
    
        };
        this.indice = i;
      }
    
    
      editarTipoEmpresa(){
        this.tipoempresaService.editarTipoEmpresa(this.tipoEmpresaEditando).subscribe(data => {
          this.toastr.success('Tipo de empresa editado con éxito');
          this.listTipoE[this.indice].tipo_empresa = this.tipoEmpresaEditando.tipo_empresa;
          this.listTipoE[this.indice].descripcion = this.tipoEmpresaEditando.descripcion;
    
          
            // Recargar la página
            location.reload();
            // Actualizar la vista
            this.ngZone.run(() => {        
            });
        
        });
      }
    }
    
    
    
    