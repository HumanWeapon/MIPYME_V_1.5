import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { environment } from 'src/enviroments/enviromet';

@Injectable({
  providedIn: 'root'
})
export class PaisesService {

  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/paises'
    // Asignar un valor a una clave en localStorage

   }


  addPais(req: Paises): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Paises>(`${this.myAppUrl}${this.myApiUrl}/postPais`, req, { headers: headers })
  }
  
  getAllPaises(): Observable<Paises[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Paises[]>(`${this.myAppUrl}${this.myApiUrl}/getAllPaises`, { headers: headers })
  }

  getPais(pais: any): Observable<Paises[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Paises[]>(`${this.myAppUrl}${this.myApiUrl}/getOnePaises`,pais, { headers: headers })
  }
  inactivarPais(pais: Paises): Observable<Paises>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Paises>(`${this.myAppUrl}${this.myApiUrl}/inactivatePais`, pais, { headers: headers })
  }
  activarPais(pais: Paises): Observable<Paises>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Paises>(`${this.myAppUrl}${this.myApiUrl}/activatePais`, pais, { headers: headers })
  }

  editarPais(pais: Paises): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Paises>(`${this.myAppUrl}${this.myApiUrl}/updatePais`, pais, { headers: headers })
  }
  deletePais(pais: Paises): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Paises>(`${this.myAppUrl}${this.myApiUrl}/updatePais`, pais, { headers: headers })
  }
}
