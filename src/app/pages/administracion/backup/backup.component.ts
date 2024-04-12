// backup.component.ts
import { Component } from '@angular/core';
import { BackupService } from 'src/app/services/administracion/backup.service';
import { ToastrService } from 'ngx-toastr';
import { data } from 'jquery';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from 'src/app/services/error.service';

  @Component({
    selector: 'app-backup',
    templateUrl: './backup.component.html',
    styleUrls: ['./backup.component.css']
  })
  export class BackupComponent {
  
    constructor(private backupService: BackupService,
      private _toastr: ToastrService,
      private _errorService: ErrorService
    ) { }

    realizarCopiaSeguridad() {
      this.backupService.realizarCopiaSeguridad().subscribe({
        next: (data)=> {
          this._toastr.success('Copia de seguridad realizada correctamente');
        },
        error: (e: HttpErrorResponse) =>{
          this._errorService.msjError(e);
        }
      });
    }
  }




  