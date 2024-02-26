import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { TipoContacto } from '../../interfaces/mantenimiento/tipoContacto';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoContactoService {

  public tipoContacto: TipoContacto | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/tipoContacto'
    // Asignar un valor a una clave en localStorage

   }



   addTipoContacto(tipoC: TipoContacto): Observable<any> {
    const nuevoTipoContacto = {
      tipo_contacto: tipoC.tipo_contacto, 
      descripcion: tipoC.descripcion,
      creado_por: tipoC.creado_por, 
      fecha_creacion: tipoC.fecha_creacion, 
      modificado_por: tipoC.modificado_por, 
      fecha_modificacion: tipoC.fecha_modificacion,
      estado: tipoC.estado,
      };
      return this.http.post<TipoContacto>(`${this.myAppUrl}${this.myApiUrl}/postTipoContacto`, nuevoTipoContacto)
  }

  
   getTipoContacto(tipoContacto: TipoContacto): Observable<TipoContacto> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoContacto>(`${this.myAppUrl}${this.myApiUrl}/getTipoContacto`, tipoContacto, { headers: headers })
   }

   getAllTipoContactos(): Observable<TipoContacto[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<TipoContacto[]>(`${this.myAppUrl}${this.myApiUrl}/getAllTipoContactos`, { headers: headers })
   }

   getAllTipoContactosActicvos(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllTipoContactosActivos`, { headers: headers })
   }
   inactivarTipoContacto(tipoContacto: TipoContacto): Observable<TipoContacto>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoContacto>(`${this.myAppUrl}${this.myApiUrl}/inactivateTipoContacto`, tipoContacto, { headers: headers })
   }
   activarTipoContacto(tipoContacto: TipoContacto): Observable<TipoContacto>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoContacto>(`${this.myAppUrl}${this.myApiUrl}/activateTipoContacto`, tipoContacto, { headers: headers })
   }

   editarTipoContacto(tipoContacto: TipoContacto): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoContacto>(`${this.myAppUrl}${this.myApiUrl}/updateTipoContacto`, tipoContacto, { headers: headers })
  }
}



















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */