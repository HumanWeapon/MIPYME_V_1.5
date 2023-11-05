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
    const nuevoParametro = {
      id_parametro: parametro.id_parametro,
      parametro: parametro.parametro,
      valor: parametro.valor,
      id_usuario: parametro.id_usuario,
      creado_por: parametro.creado_por,
      fecha_creacion: parametro.fecha_creacion,
      modificado_por: parametro.modificado_por,
      fecha_modificacion: parametro.fecha_modificacion,
      alerta_busqueda: parametro.alerta_busqueda
      };
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/postParametro`, nuevoParametro, { headers: headers })
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


   inactivarParametro(parametros: Parametros): Observable<Parametros>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/inactivateParametro`, parametros, { headers: headers })
   }
   activarParametro(parametros: Parametros): Observable<Parametros>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/activateParametro`, parametros, { headers: headers })
   }
   
  
   editarParametro(parametros: Parametros): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Parametros>(`${this.myAppUrl}${this.myApiUrl}/updateParametro`, parametros, { headers: headers })
  }
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */