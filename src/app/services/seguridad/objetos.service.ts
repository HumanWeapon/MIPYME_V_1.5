import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Objetos } from '../../interfaces/seguridad/objetos';
import { Observable, catchError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ObjetosService {

  public objetos: Objetos | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/objetos'
    // Asignar un valor a una clave en localStorage

   }



   addObjeto(obj: Objetos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/postObjeto`, obj, { headers: headers })
  }

  
   getObjeto(objetos: Objetos): Observable<Objetos> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/getObjeto`, objetos, { headers: headers })
   }

   getAllObjetos(): Observable<Objetos[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Objetos[]>(`${this.myAppUrl}${this.myApiUrl}/getAllObjetos`, { headers: headers })
   }
   inactivarObjeto(objetos: Objetos): Observable<Objetos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/inactivateObjeto`, objetos, { headers: headers })
   }
   activarObjeto(objetos: Objetos): Observable<Objetos>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/activateObjeto`, objetos, { headers: headers })
   }

   editarObjeto(objetos: Objetos): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Objetos>(`${this.myAppUrl}${this.myApiUrl}/updateObjetos`, objetos, { headers: headers })
  }
}


/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */