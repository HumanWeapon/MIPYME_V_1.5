import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/enviroments/enviromet';
import { Usuario } from '../interfaces/usuario';
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

   addUsuario(user: Usuario): Observable<any> {
    const nuevoUsuario = {
      creado_por: "SYSTEM",
      fecha_creacion: user.fecha_creacion,
      modificado_por: "SYSTEM",
      fecha_modificacion: "",
      usuario: user.usuario,
      nombre_usuario: user.nombre_usuario,
      correo_electronico: user.correo_electronico,
      estado_usuario: user.estado_usuario,
      contrasena: user.contrasena,
      id_rol: user.id_rol,
      fecha_ultima_conexion: "",
      fecha_vencimiento: user.fecha_vencimiento,
      intentos_fallidos: user.intentos_fallidos
      };
      return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/postUsuario`, nuevoUsuario)
  }

  login(usuario: Usuario): Observable<string> {
    return this.http.post<string>(`${this.myAppUrl}${this.myApiUrl}/login`, usuario)
  }
  getOneUsuario(usuario: any): Observable<Usuario> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/getUsuario`, usuario)
  }

  getUsuario(usuario: Usuario): Observable<Usuario> {
    const token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`)
    return this.http.post<Usuario>(`${this.myAppUrl}${this.myApiUrl}/getUsuario`, usuario)
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
}