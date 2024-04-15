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

   inactivarPermiso(id_permisos: Permisos): Observable<Permisos>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Datos que se están enviando para inactivar el permiso:', id_permisos); // Agregar esta línea para imprimir los datos
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/inactivatePermiso`, id_permisos, { headers: headers });
  }
  
  activarPermiso(id_permisos: Permisos): Observable<Permisos>{
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Datos que se están enviando para activar el permiso:', id_permisos); // Agregar esta línea para imprimir los datos
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/activatePermiso`, id_permisos, { headers: headers });
  }

   editarPermiso(permisos: Permisos): Observable<any> {
    return this.http.post<Permisos>(`${this.myAppUrl}${this.myApiUrl}/updatePermisos`, permisos)
  }

  //consulta los contactos registrados y no registrados de una empresa por el id
  objetosSinRol(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/objetosSinRol/${id}`, { headers: headers });
  }
  //consulta los permisos de los roles para poder acceder a las rutas.
  permisosdeRoutes(id_rol: string, id_objeto: string, id_usuario: string ): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/permisosdeRoutes/${id_rol}/${id_objeto}/${id_usuario}`, { headers: headers });
  }
}
