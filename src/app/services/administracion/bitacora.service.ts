import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/enviromet';
import { Observable, catchError } from 'rxjs';
import { Bitacora } from 'src/app/interfaces/administracion/bitacora';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  errorService: any;
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/bitacora'
   }


 
   // Método para obtener los registros de bitácora de forma descendente por fecha
   getBitacoraDescendente(): Observable<Bitacora[]> {
     return this.http.get<Bitacora[]>(`${this.myApiUrl}?orderBy=fecha_desc`);
   }

   getBitacora(): Observable<Bitacora[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Bitacora[]>(`${this.myAppUrl}${this.myApiUrl}/getAllBitacora`, { headers: headers })
   }

   DeleteBitacora(): Observable<Bitacora> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<Bitacora>(`${this.myAppUrl}${this.myApiUrl}/deleteBitacora`, { headers: headers })
      .pipe(
        catchError((error: any) => {
          // Manejo de errores, por ejemplo, registrar en la consola o notificar al usuario
          console.error('Error en la solicitud DELETE:', error);
          throw error; // Re-lanza el error para que otros puedan manejarlo
        })
      );
  }
  insertBitacora(Bitacora: any): Observable<Bitacora> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Bitacora>(`${this.myAppUrl}${this.myApiUrl}/postBitacora`,Bitacora, { headers: headers })
      .pipe(
        catchError((error: any) => {
          // Manejo de errores, por ejemplo, registrar en la consola o notificar al usuario
          throw error; 
        })
      );
  }

  getBitacoraByDateRange(fechaDesde: string, fechaHasta: string): Observable<any> {
    // Realizar la petición HTTP para obtener los registros en el rango de fechas
    return this.http.get<Bitacora[]>(`/api/bitacora`, { params: { fechaDesde, fechaHasta } });
  }

  

}


