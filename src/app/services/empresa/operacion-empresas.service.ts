import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { operacionEmpresas } from 'src/app/interfaces/empresa/operacion-empresas';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class OperacionEmpresasService {
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/opempresa'
    // Asignar un valor a una clave en localStorage
  }

  getOpEmpresa(id_op_empresa: operacionEmpresas): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<any>(`${this.myAppUrl}${this.myApiUrl}/getOpEmpresa`, id_op_empresa,{ headers: headers })
  }

  getAllOpEmpresas(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllOpEmpresas`, { headers: headers })
  }
}
