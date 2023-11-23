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

   

   addPermiso(permiso: Permisos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/postPermiso`, permiso, { headers: headers })
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
