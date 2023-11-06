import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { TipoEmpresa } from '../../interfaces/mantenimiento/tipoEmpresa';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoEmpresaService {

  public tipoEmpresa: TipoEmpresa | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/tipoEmpresa'
    // Asignar un valor a una clave en localStorage

   }

   
   addTipoEmpresa(tipoE: TipoEmpresa): Observable<any> {
    const nuevoTipoEmpresa = {
      tipo_empresa: tipoE.tipo_empresa, 
      descripcion: tipoE.descripcion,
      creado_por: tipoE.creado_por, 
      fecha_creacion: tipoE.fecha_creacion, 
      modificado_por: tipoE.modificado_por, 
      fecha_modificacion: tipoE.fecha_modificacion,
      estado: tipoE.estado,
      };
      return this.http.post<TipoEmpresa>(`${this.myAppUrl}${this.myApiUrl}/postTipoEmpresa`, nuevoTipoEmpresa)
  }

  
   getTipoEmpresa(tipoEmpresa: TipoEmpresa): Observable<TipoEmpresa> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoEmpresa>(`${this.myAppUrl}${this.myApiUrl}/getTipoEmpresa`, tipoEmpresa, { headers: headers })
   }

   getAllTipoEmpresa(): Observable<TipoEmpresa[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<TipoEmpresa[]>(`${this.myAppUrl}${this.myApiUrl}/getAllTipoEmpresa`, { headers: headers })
   }
   inactivarTipoEmpresa(tipoEmpresa: TipoEmpresa): Observable<TipoEmpresa>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoEmpresa>(`${this.myAppUrl}${this.myApiUrl}/inactivateTipoEmpresa`, tipoEmpresa, { headers: headers })
   }
   activarTipoEmpresa(tipoEmpresa: TipoEmpresa): Observable<TipoEmpresa>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoEmpresa>(`${this.myAppUrl}${this.myApiUrl}/activateTipoEmpresa`, tipoEmpresa, { headers: headers })
   }

   editarTipoEmpresa(tipoEmpresa: TipoEmpresa): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<TipoEmpresa>(`${this.myAppUrl}${this.myApiUrl}/updateTipoEmpresa`, tipoEmpresa, { headers: headers })
  }
}
