import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
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


   addEmpresa(empresa: Empresa): Observable<any> {
    const nuevaEmpresa = {   

        id_tipo_empresa: empresa.id_tipo_empresa,
        nombre_empresa: empresa.nombre_empresa,
        descripcion: empresa.descripcion, 
        creado_por: "ISMAELM",
        fecha_creacion: empresa.fecha_creacion,
        modificado_por: "ISMAELM",
        fecha_modificacion: empresa.fecha_modificacion,
        estado: empresa.estado
      };
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Empresa>(`${this.myAppUrl}${this.myApiUrl}/postEmpresa`, nuevaEmpresa, { headers: headers })
  }


   getEmpresa(empresa: Empresa): Observable<Empresa> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Empresa>(`${this.myAppUrl}${this.myApiUrl}/getEmpresa`, empresa,{ headers: headers })
  }

  getAllEmpresas(): Observable<Empresa[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Empresa[]>(`${this.myAppUrl}${this.myApiUrl}/getAllEmpresas`,  { headers: headers })
  }

  inactivarEmpresa(empresa: Empresa): Observable<Empresa>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Empresa>(`${this.myAppUrl}${this.myApiUrl}/inactivateEmpresa`, empresa, { headers: headers })
  }

  activarEmpresa(empresa: Empresa): Observable<Empresa>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Empresa>(`${this.myAppUrl}${this.myApiUrl}/activateEmpresa`, empresa, { headers: headers })
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