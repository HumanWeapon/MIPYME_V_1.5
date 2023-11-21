import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Contacto } from '../../interfaces/contacto/contacto';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {

  public contacto: Contacto | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/contacto'
    // Asignar un valor a una clave en localStorage

   }



   addContacto(contac: Contacto): Observable<any> {
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/postContacto`, contac, { headers: headers })
  }

  
   getContacto(contacto: Contacto): Observable<Contacto> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/getContacto`, contacto, { headers: headers })
   }
   getContactoID(dni: any): Observable<Contacto[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto[]>(`${this.myAppUrl}${this.myApiUrl}/getContacto`, { dni: dni }, { headers: headers })
   }

   getAllContactos(): Observable<Contacto[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Contacto[]>(`${this.myAppUrl}${this.myApiUrl}/getAllContactos`, { headers: headers })
   }
   inactivarContacto(contacto: Contacto): Observable<Contacto>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/inactivateContacto`, contacto, { headers: headers })
   }
   activarContacto(contacto: Contacto): Observable<Contacto>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/activateContacto`, contacto, { headers: headers })
   }

   editarContacto(contacto: Contacto): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Contacto>(`${this.myAppUrl}${this.myApiUrl}/updateContacto`, contacto, { headers: headers })
  }
}













/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */







