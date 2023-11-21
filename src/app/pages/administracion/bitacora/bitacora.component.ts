import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Bitacora } from 'src/app/interfaces/administracion/bitacora';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { BitacoraService } from 'src/app/services/administracion/bitacora.service';
import { ErrorService } from 'src/app/services/error.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent implements OnInit{
  bitacora: Bitacora[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  
  getAllUser: Usuario[] = [];

  constructor(
    private _bitacoraService: BitacoraService,
    private _userService: UsuariosService,
    private _toastr: ToastrService,
    private _errorService: ErrorService){}

  ngOnInit(): void {
    this.getBitacora();
  }
  getBitacora(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._bitacoraService.getBitacora().subscribe((res: any) =>{
      this.bitacora = res;
      this.dtTrigger.next(0);
    })
  }
  getUsuario(){
   this._userService.getAllUsuarios().subscribe({
     next: (data) => {
       this.getAllUser = data;
     },
     error: (e: HttpErrorResponse) => {
       this._errorService.msjError(e);
     }
   });
 }
 
 
 deleteBitacora() {
  this._bitacoraService.DeleteBitacora().subscribe(
    data => {
      this._toastr.success('La bitácora se ha limpiado exitosamente');
      this.getBitacora(); // Actualiza la vista después de borrar
    },
    error => {
      this._toastr.error('Hubo un error al limpiar la bitácora');
      console.error('Error al borrar bitácora:', error);
    }
  );
}

}
