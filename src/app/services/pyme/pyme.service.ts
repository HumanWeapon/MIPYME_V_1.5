import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Pyme } from '../../interfaces/pyme/pyme';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class PymeService {

  public pyme: Pyme | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/pyme'
    // Asignar un valor a una clave en localStorage
   }

   PostPyme(pyme: any): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/postPyme`, pyme, { headers: headers })
}

 
   addPyme(pyme: Pyme): Observable<any> {
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Pyme>(`${this.myAppUrl}${this.myApiUrl}/postPyme`, pyme, { headers: headers })
  }

  loginPyme(nombre_pyme: Pyme): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/login`, nombre_pyme)
  }

  getPyme(pyme: Pyme): Observable<Pyme> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Pyme>(`${this.myAppUrl}${this.myApiUrl}/getPyme`, pyme,{ headers: headers })
  }

  getRolPyme(): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any>(`${this.myAppUrl}${this.myApiUrl}/getRolPyme`,{ headers: headers })
  }
  getOnePyme(nombre_pyme: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.myAppUrl}${this.myApiUrl}/getOnePyme/${nombre_pyme}`, { headers: headers });
  }

  getAllPymes(): Observable<Pyme[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Pyme[]>(`${this.myAppUrl}${this.myApiUrl}/getAllPymes`,  { headers: headers })
  }
  getEmpresasPymes(id_tipo_empresa: any): Observable<Pyme[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const requestBody = { id_tipo_empresa }; // Coloca el id_tipo_empresa en un objeto
    return this.http.post<Pyme[]>(`${this.myAppUrl}${this.myApiUrl}/getEmpresasPymes`, requestBody, { headers: headers });
  }
  

  inactivarPyme(nombre_pyme: Pyme): Observable<Pyme>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Pyme>(`${this.myAppUrl}${this.myApiUrl}/inactivatePyme`, nombre_pyme, { headers: headers })
   }
   activarPyme(nombre_pyme: Pyme): Observable<Pyme>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Pyme>(`${this.myAppUrl}${this.myApiUrl}/activatePyme`, nombre_pyme, { headers: headers })
   }

   editarPymes(pyme: Pyme): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Pyme>(`${this.myAppUrl}${this.myApiUrl}/updatePyme`, pyme, { headers: headers })
  }

  deletePyme(id_pyme: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.myAppUrl}${this.myApiUrl}/deletePyme`,{ body: { id_pyme: id_pyme } });
  }

  editarPyme(pyme: Pyme): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Pyme>(`${this.myAppUrl}${this.myApiUrl}/updatePyme`, pyme, { headers: headers })
  }

  pymesAllTipoEmpresa(): Observable<Pyme[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Pyme[]>(`${this.myAppUrl}${this.myApiUrl}/pymesAllTipoEmpresa`, { headers: headers })
  }



}