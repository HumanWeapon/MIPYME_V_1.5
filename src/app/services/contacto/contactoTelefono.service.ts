import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { ContactoTelefono } from '../../interfaces/contacto/contactoTelefono';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactoTService {

  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/telefonos'
    // Asignar un valor a una clave en localStorage

   }

   addContactoT(contactoT: ContactoTelefono): Observable<any> {
      const token = localStorage.getItem('token')
      const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
      return this.http.post<ContactoTelefono>(`${this.myAppUrl}${this.myApiUrl}/postContactoTelefono`, contactoT, { headers: headers })
  }

  
   getContactoTelefono(contactoTelefono: ContactoTelefono): Observable<ContactoTelefono> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoTelefono>(`${this.myAppUrl}${this.myApiUrl}/getContactoTelefono`, contactoTelefono, { headers: headers })
   }
   getTelefonos(id_contacto: any): Observable<ContactoTelefono[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoTelefono[]>(`${this.myAppUrl}${this.myApiUrl}/getContactoTelefono`, { id_contacto: id_contacto }, { headers: headers })
   }

   getAllContactosTelefono(): Observable<ContactoTelefono[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<ContactoTelefono[]>(`${this.myAppUrl}${this.myApiUrl}/getAllContactosTelefono`, { headers: headers })
   }
   inactivarContactoTelefono(contactoTelefono: ContactoTelefono): Observable<ContactoTelefono>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoTelefono>(`${this.myAppUrl}${this.myApiUrl}/inactivateContactoTelefono`, contactoTelefono, { headers: headers })
   }
   activarContactoTelefono(contactoTelefono: ContactoTelefono): Observable<ContactoTelefono>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoTelefono>(`${this.myAppUrl}${this.myApiUrl}/activateContactoTelefono`, contactoTelefono, { headers: headers })
   }

   editarContactoTelefono(contactoTelefono: ContactoTelefono): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<ContactoTelefono>(`${this.myAppUrl}${this.myApiUrl}/updateContactoTelefono`, contactoTelefono, { headers: headers })
  }
  telefonosdeContactosPorId(id: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/telefonosdeContactosPorId/${id}`, { headers: headers });
  }
  telefonosconcontacto(): Observable<any[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<any[]>(`${this.myAppUrl}${this.myApiUrl}/telefonosconcontacto`, { headers: headers })
   }
}
/*                                          FRANKLIN ALEXANDER MURILLO CRUZ
                                                CUENTA: 20151021932
 */