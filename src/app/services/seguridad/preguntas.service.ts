import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Preguntas } from '../../interfaces/seguridad/preguntas';
import { Observable, catchError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PreguntasService {

  public preguntas: Preguntas | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/preguntas'
    // Asignar un valor a una clave en localStorage

   }

  addPregunta(preguntas: Preguntas): Observable<any> {
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Preguntas>(`${this.myAppUrl}${this.myApiUrl}/postPregunta`, preguntas, { headers: headers })
  }

   getPregunta(preguntas: Preguntas): Observable<Preguntas> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas>(`${this.myAppUrl}${this.myApiUrl}/getPregunta`, preguntas, { headers: headers })
   }

   getAllPreguntas(): Observable<Preguntas[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Preguntas[]>(`${this.myAppUrl}${this.myApiUrl}/getAllPreguntas`, { headers: headers })
   }

   inactivarPregunta(preguntas: Preguntas): Observable<Preguntas>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas>(`${this.myAppUrl}${this.myApiUrl}/inactivatePregunta`, preguntas, { headers: headers })
   }
   activarPregunta(preguntas: Preguntas): Observable<Preguntas>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas>(`${this.myAppUrl}${this.myApiUrl}/activatePregunta`, preguntas, { headers: headers })
   }

   editarPregunta(preguntas: Preguntas): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Preguntas>(`${this.myAppUrl}${this.myApiUrl}/updatePregunta`, preguntas, { headers: headers })
  }
  
  getPreguntas(): Observable<Preguntas[]> {
    /*  const token = localStorage.getItem('token')
     const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`) */
    /*     return this.http.get<Product[]>(`${this.myAppUrl}${this.myApiUrl}`, { headers: headers } ) */
    return this.http.get<Preguntas[]>(`${this.myAppUrl}${this.myApiUrl}/getAllPreguntas` )
  }
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */