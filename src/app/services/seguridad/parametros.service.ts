import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Parametros } from '../../interfaces/seguridad/parametros';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  public parametros: Parametros | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/parametros'
    // Asignar un valor a una clave en localStorage

   }

   addParametro(parametro: Parametros): Observable<any> {
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/postParametro`, parametro, { headers: headers })
  }

  getParametroPreguntasdeSeguridad(): Observable<Parametros> {
    return this.http.get<Parametros>(`${this.myAppUrl}${this.myApiUrl}/getParametroPreguntasdeSeguridad`)
  }

  getParametroPuertoCorreo(): Observable<Parametros> {
    return this.http.get<Parametros>(`${this.myAppUrl}${this.myApiUrl}/getParametroPuertoCorreo`)
  }

   getParametro(parametros: Parametros): Observable<Parametros> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/getParametro`, parametros, { headers: headers })
   }

   getAllParametros(): Observable<Parametros[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Parametros[]>(`${this.myAppUrl}${this.myApiUrl}/getAllParametros`, { headers: headers })
   }

   inactivateParametro(parametro: Parametros): Observable<Parametros>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/inactivateParametro`, parametro, { headers: headers })
   }
   activateParametro(parametro: Parametros): Observable<Parametros>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/activateParametro`, parametro, { headers: headers })
   }
   
   editarParametro(parametro: Parametros): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/updateParametro`, parametro, { headers: headers })
  }
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */