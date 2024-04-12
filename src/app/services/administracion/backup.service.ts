import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private myAppUrl: string;
  private myApiUrl: string;

  // Datos de conexión
  private readonly PGHOST = 'viaduct.proxy.rlwy.net';
  private readonly PGDATABASE = 'railway';
  private readonly PGPASSWORD = '1Fd145Gdd24g1daGfccFdeaCFEdbFDDc';
  private readonly PGPORT = '47331';
  private readonly PGUSER = 'postgres';

  constructor(private http: HttpClient) { 
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/generar_backup'
    // Asignar un valor a una clave en localStorage
  }

  realizarCopiaSeguridad(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.myAppUrl}${this.myApiUrl}/generar?PGHOST=${this.PGHOST}&PGDATABASE=${this.PGDATABASE}&PGPASSWORD=${this.PGPASSWORD}&PGPORT=${this.PGPORT}&PGUSER=${this.PGUSER}`;
    return this.http.get<any>(url, { headers: headers });
  }
}




