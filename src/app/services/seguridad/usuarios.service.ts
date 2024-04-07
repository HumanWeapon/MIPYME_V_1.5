import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Usuario } from '../../interfaces/seguridad/usuario';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  public usuario: Usuario | undefined;
  
  private myAppUrl: string;
  private myApiUrl: string;

  constructor(private http: HttpClient) {
    this.myAppUrl = environment.endpoint;
    this.myApiUrl = 'api/users'
    // Asignar un valor a una clave en localStorage

   }

  addUsuario(user: Usuario): Observable<Usuario> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/postUsuario`, user,{ headers: headers })
  }

  login(usuario: Usuario): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/login`, usuario)
  }
  getOneUsuario(usuario: any): Observable<Usuario> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/getUsuario`, {usuario: usuario},{ headers: headers })
  }

  getUsuario(usuario: Usuario): Observable<Usuario> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/getUsuario`, usuario, { headers: headers })
  }
  

  getAllUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.myAppUrl}${this.myApiUrl}/getAllUsuarios`)
  }
  inactivarUsuario(usuario: Usuario): Observable<Usuario>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/inactivateUsuario`, usuario, { headers: headers })
  }
  activarUsuario(usuario: Usuario): Observable<Usuario>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/activateUsuario`, usuario, { headers: headers })
  }
  cambiarContrasena(usuario: Usuario): Observable<Usuario>{
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.put<Usuario>(`${this.myAppUrl}${this.myApiUrl}/cambiarContrasena`, usuario, { headers: headers })
  }
  editarUsuario(usuario: Usuario): Observable<any> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/updateUsuario`, usuario, { headers: headers })
  }

  usuariosAllRoles(): Observable<Usuario[]> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.get<Usuario[]>(`${this.myAppUrl}${this.myApiUrl}/usuariosAllRoles`, { headers: headers })
  }

  getCorreoElectronicoPorUsuario(usuario: string): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/getCorreoElectronicoPorUsuario`, { usuario }, { headers: headers });
  }

  forgotPassword(correo_electronico: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { correo_electronico: correo_electronico }; // Construye el objeto con la propiedad correo_electronico
    return this.http.put<any>(`${this.myAppUrl}${this.myApiUrl}/forgot-password`, body, { headers: headers });
  }

  resetPassword(newPassword: string, resetToken: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { newPassword, resetToken };
    return this.http.put(`${this.myAppUrl}${this.myApiUrl}/resetPassword/${resetToken}`, body, { headers });
  }
  


  
}