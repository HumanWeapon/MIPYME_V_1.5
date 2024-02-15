import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Roles } from 'src/app/interfaces/seguridad/roles';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/roles';
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
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/inactivateRol`, rol , { headers });
  }
  
   activarRol(rol: Roles): Observable<Roles>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/activateRol`, rol, { headers: headers })
   }
  
   editarRol(rol: Roles): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Roles>(`${this.myAppUrl}${this.myApiUrl}/updateRoles`, rol, { headers: headers })
  }
}
















/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */