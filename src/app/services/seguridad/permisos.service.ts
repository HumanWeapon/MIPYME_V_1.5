import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Permisos } from '../../interfaces/seguridad/permisos';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  public permisos: Permisos | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/permisos'
   }

   

   addPermiso(per: Permisos): Observable<any> {
    const nuevoPermiso = {
      id_permisos: 0,    
      id_rol: per.id_rol, 
      id_objeto: per.id_objeto,
      permiso_insercion: per.permiso_insercion,
      permiso_eliminacion: per.permiso_eliminacion,
      permiso_actualizacion: per.permiso_actualizacion,
      permiso_consultar: per.permiso_consultar,      
      creado_por: per.creado_por, 
      fecha_creacion: per.fecha_creacion, 
      modificado_por: per.modificado_por, 
      fecha_modificacion: per.fecha_modificacion
      };
      return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/postPermiso`, nuevoPermiso)
  }

  
  getPermiso(permisos: Permisos): Observable<Permisos> {
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/getPermiso`, permisos)
   }

   getAllPermisos(): Observable<Permisos[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Permisos[]>(`${this.myAppUrl}${this.myApiUrl}/getAllPermisos`, { headers: headers })
   }

   inactivarPermiso(permisos: Permisos): Observable<Permisos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/inactivatePermiso`, permisos, { headers: headers })
   }

   activarPermiso(permisos: Permisos): Observable<Permisos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/activatePermiso`, permisos, { headers: headers })
   }

   editarPermiso(permisos: Permisos): Observable<any> {
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/updatePermisos`, permisos)
  }
}
