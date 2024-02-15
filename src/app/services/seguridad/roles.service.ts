import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Roles } from '../../interfaces/seguridad/roles';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  public roles: Roles | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/roles'
    // Asignar un valor a una clave en localStorage

   }

   addRol(roles: Roles): Observable<any> {

    const nuevoRol = {
      rol: roles.rol, 
      descripcion: roles.descripcion, 
      estado_rol: roles.estado_rol,
      creado_por: roles.creado_por, 
      fecha_creacion: roles.fecha_creacion, 
      modificado_por: roles.modificado_por, 
      fecha_modificacion: roles.fecha_modificacion
      };
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/postRol`, nuevoRol, { headers: headers })
  }

   getRol(roles: Roles): Observable<Roles> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/getRol`, roles, { headers: headers })
   }

   getAllRoles(): Observable<Roles[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Roles[]>(`${this.myAppUrl}${this.myApiUrl}/getAllRoles`, { headers: headers })
   }

   inactivarRol(rol: Roles): Observable<Roles> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/inactivateRol`, rol , { headers: headers });
  }
  
   activarRol(rol: Roles): Observable<Roles>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/activateRol`, rol, { headers: headers })
   }
  
   editarRol(roles: Roles): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/updateRoles`, roles, { headers: headers })
  }
}
















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */