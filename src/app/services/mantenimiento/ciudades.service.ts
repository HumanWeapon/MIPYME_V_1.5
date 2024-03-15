import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Ciudades } from '../../interfaces/mantenimiento/ciudades';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CiudadesService {

  public ciudades: Ciudades | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/ciudades'
    // Asignar un valor a una clave en localStorage

   }

   addCiudad(ciu: Ciudades): Observable<Ciudades> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Ciudades>(`${this.myAppUrl}${this.myApiUrl}/postCiudad`, ciu,{ headers: headers })
  }

  
   getCiudad(ciudades: Ciudades): Observable<Ciudades> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Ciudades>(`${this.myAppUrl}${this.myApiUrl}/getCiudad`, ciudades, { headers: headers })
   }

   getAllCiudades(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getAllCiudades`, { headers: headers })
   }
   inactivarCiudad(ciudades: Ciudades): Observable<Ciudades>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Ciudades>(`${this.myAppUrl}${this.myApiUrl}/inactivateCiudad`, ciudades, { headers: headers })
   }
   activarCiudad(ciudades: Ciudades): Observable<Ciudades>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Ciudades>(`${this.myAppUrl}${this.myApiUrl}/activateCiudad`, ciudades, { headers: headers })
   }

   editarCiudad(ciudades: Ciudades): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Ciudades>(`${this.myAppUrl}${this.myApiUrl}/updateCiudad`, ciudades, { headers: headers })
  }
  getCiudades(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/getCiudades`, { headers: headers })
   }
   
   ciudadesAllPaises(): Observable<Ciudades[]> {
    const token = localStorage.getItem('token');
    console.log('Token de autorización:', token); // Agregar esta línea para imprimir el token en la consola
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Ciudades[]>(`${this.myAppUrl}${this.myApiUrl}/ciudadesAllPaises`, { headers: headers });
  }
  


}






/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */