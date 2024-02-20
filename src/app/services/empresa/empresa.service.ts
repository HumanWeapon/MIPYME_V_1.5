import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Empresa } from '../../interfaces/empresa/empresas';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  public empresa: Empresa | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/empresa'
    // Asignar un valor a una clave en localStorage
   }


  addEmpresa(empresa: any): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/postEmpresa`, empresa, { headers: headers })
  }

  loginPyme(nombre_empresa: Empresa): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/loginPyme`, nombre_empresa)
  }

  getEmpresa(nombre_empresa: Empresa): Observable<Empresa> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Empresa>(`${this.myAppUrl}${this.myApiUrl}/getEmpresa`, nombre_empresa,{ headers: headers })
  }

  getAllEmpresas(): Observable<Empresa[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Empresa[]>(`${this.myAppUrl}${this.myApiUrl}/getAllEmpresas`,  { headers: headers })
  }
  getEmpresasPymes(id_tipo_empresa: number): Observable<Empresa[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const requestBody = { id_tipo_empresa }; // Aquí asegúrate de que id_tipo_empresa se envía correctamente
    return this.http.post<Empresa[]>(`${this.myAppUrl}${this.myApiUrl}/getEmpresasPymes`, requestBody, { headers: headers });
  }

  inactivarEmpresa(id_empresa: Empresa): Observable<string>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/inactivateEmpresa`, { id_empresa: id_empresa }, { headers: headers })
  }

  activarEmpresa(id_empresa: Empresa): Observable<string>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/activateEmpresa`, { id_empresa: id_empresa }, { headers: headers })
  }

  deleteEmpresa(id_empresa: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.myAppUrl}${this.myApiUrl}/deleteEmpresa`,{ body: { id_empresa: id_empresa } });
  }

  editarEmpresa(empresa: Empresa): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Empresa>(`${this.myAppUrl}${this.myApiUrl}/updateEmpresa`, empresa, { headers: headers })
  }

  pymesAllTipoEmpresa(): Observable<Empresa[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Empresa[]>(`${this.myAppUrl}${this.myApiUrl}/pymesAllTipoEmpresa`, { headers: headers })
  }


}

/*                                          ISMAEL ANTONIO MIDENCE MEZA
                                                CUENTA: 20171006059
 */