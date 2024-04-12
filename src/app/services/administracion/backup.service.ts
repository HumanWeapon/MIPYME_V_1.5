import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackupService {

  // Datos de conexión
  private readonly PGHOST = 'viaduct.proxy.rlwy.net';
  private readonly PGDATABASE = 'railway';
  private readonly PGPASSWORD = '1Fd145Gdd24g1daGfccFdeaCFEdbFDDc';
  private readonly PGPORT = '47331';
  private readonly PGUSER = 'postgres';

  constructor(private http: HttpClient) { }

  realizarCopiaSeguridad(): Observable<any> {
    const url = `http://localhost:4200/backup?PGHOST=${this.PGHOST}&PGDATABASE=${this.PGDATABASE}&PGPASSWORD=${this.PGPASSWORD}&PGPORT=${this.PGPORT}&PGUSER=${this.PGUSER}`;
    return this.http.get<any>(url);
  }
}




