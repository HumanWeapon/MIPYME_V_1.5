import { Injectable, OnInit } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { PermisosService } from '../services/seguridad/permisos.service';


@Injectable({
  providedIn: 'root'
})

export class PermisosGuard implements CanActivate{
  id_rol: any = ''
  id_objeto: any = ''
  id_objeto2: any = ''
  id_usuario: any = ''

  constructor(private _permisosService: PermisosService, private router: Router) {
    // Obtener los identificadores de roles, objeto y usuario del localStorage
    this.id_rol = localStorage.getItem('id_rol');
    this.id_objeto = localStorage.getItem('id_objeto');
    this.id_objeto2 = this.id_objeto;
    this.id_usuario = localStorage.getItem('id_usuario');
    
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log(this.id_rol);
    console.log(this.id_objeto);
    if(this.id_rol && this.id_objeto && this.id_usuario) {

      return this._permisosService.permisosdeRoutes(this.id_rol, this.id_objeto2, this.id_usuario).pipe(
        map(permisos => {
          if (permisos) {
            //console.log(permisos)
            // Si el usuario tiene permisos, permite el acceso a la ruta
            return true;
          } else {
            // Si el usuario no tiene permisos, redirige a una página de acceso denegado
            return this.router.createUrlTree(['/dashboard/access-denied']);
          }
        }),
        catchError(() => {
          this.router.navigate(['/dashboard/not-found']);
          return of(false); // Envuelve el valor en un observable
        })
      );
    } else {
      // Si falta algún identificador, redirige a una página de error
      return true;
      //return this.router.createUrlTree(['/dashboard/not-found']);
    }
  }
};
