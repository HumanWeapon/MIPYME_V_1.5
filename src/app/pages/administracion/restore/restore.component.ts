import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BackupService } from 'src/app/services/administracion/backup.service';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.css']
})
export class RestoreComponent {
  
  constructor(private backupService: BackupService,
    private _toastr: ToastrService  ) { }

    
  restaurarCopiaSeguridad() {
    this.backupService.realizarCopiaSeguridad().subscribe(
      () => {
        this._toastr.success('Copia de seguridad restaurada correctamente');
        // Manejar el éxito de la restauración de la copia de seguridad
      },
      error => {
        this._toastr.error('Error al restaurar copia de seguridad:', error);
        // Manejar el error de la restauración de la copia de seguridad
      }
    );
  }
}
