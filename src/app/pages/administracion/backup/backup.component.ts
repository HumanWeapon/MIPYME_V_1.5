// backup.component.ts
import { Component } from '@angular/core';
import { BackupService } from 'src/app/services/administracion/backup.service';
import { ToastrService } from 'ngx-toastr';

  @Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.css']
  })
  export class BackupComponent {
  
    constructor(private backupService: BackupService,
      private _toastr: ToastrService,
    ) { }

    realizarCopiaSeguridad() {
      this.backupService.realizarCopiaSeguridad().subscribe(
        () => {
          this._toastr.success('Copia de seguridad realizada correctamente');
          // Manejar el éxito de la copia de seguridad
        },
        error => {
          this._toastr.warning('Error al realizar copia de seguridad:', error);
          // Manejar el error de la copia de seguridad
        }
      );
    }
  }




  