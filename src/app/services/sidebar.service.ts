import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})

export class SidebarService {
  menu:any[]=[];
  private myAppUrl: string;
  private myApiUrl: string;

  

  constructor(
    private _http: HttpClient) {
      this.myAppUrl = environment.endpoint;
      this.myApiUrl = 'api/permisos'

   }
  getPermisosRolesObjetos(id_rol: any): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this._http.post<any[]>(`${this.myAppUrl}${this.myApiUrl}/permisosRolesObjetos`, {id_rol:id_rol}, { headers: headers })
  }
}
