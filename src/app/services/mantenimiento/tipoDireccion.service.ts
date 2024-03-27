import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { TipoDireccion } from '../../interfaces/mantenimiento/tipoDireccion';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoDireccionService {

  public tipoDireccion: TipoDireccion | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/tipoDireccion'
    // Asignar un valor a una clave en localStorage

   }



   addTipoDireccion(tipoD: TipoDireccion): Observable<any> {
    const nuevoTipoDireccion = {
      tipo_direccion: tipoD.tipo_direccion, 
      descripcion: tipoD.descripcion,
      creado_por: tipoD.creado_por, 
      fecha_creacion: tipoD.fecha_creacion, 
      modificado_por: tipoD.modificado_por, 
      fecha_modificacion: tipoD.fecha_modificacion,
      estado: tipoD.estado,
      };
      return this.http.post<TipoDireccion>(`${this.myAppUrl}${this.myApiUrl}/postTipoDireccion`, nuevoTipoDireccion)
  }

  
   getTipoDireccion(tipoDireccion: TipoDireccion): Observable<TipoDireccion> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoDireccion>(`${this.myAppUrl}${this.myApiUrl}/getTipoDireccion`, tipoDireccion, { headers: headers })
   }

   getAllTipoDirecciones(): Observable<TipoDireccion[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<TipoDireccion[]>(`${this.myAppUrl}${this.myApiUrl}/getAllTipoDirecciones`, { headers: headers })
   }
   inactivarTipoDireccion(tipoDireccion: TipoDireccion): Observable<TipoDireccion>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoDireccion>(`${this.myAppUrl}${this.myApiUrl}/inactivateTipoDireccion`, tipoDireccion, { headers: headers })
   }
   activarTipoDireccion(tipoDireccion: TipoDireccion): Observable<TipoDireccion>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoDireccion>(`${this.myAppUrl}${this.myApiUrl}/activateTipoDireccion`, tipoDireccion, { headers: headers })
   }

   editarTipoDireccion(tipoDireccion: TipoDireccion): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoDireccion>(`${this.myAppUrl}${this.myApiUrl}/updateTipoDireccion`, tipoDireccion, { headers: headers })
  }
    //Obtiene todas las ciudades activas
    getTipoDirecciones(): Observable<any[]> {
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getTipoDirecciones`, { headers: headers })
     }
}









/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */