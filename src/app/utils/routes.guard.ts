import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { PermisosService } from '../services/seguridad/permisos.service';


@Injectable({
  providedIn: 'root'
})

export class PermisosGuard implements CanActivate {
  constructor(private _permisosService: PermisosService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Obtener los identificadores de roles, objeto y usuario del localStorage
    const id_rol = localStorage.getItem('id_rol');
    const id_objeto = localStorage.getItem('id_objeto');
    const id_usuario = localStorage.getItem('id_usuario');

    //console.log(id_rol);
    //console.log(id_objeto);
    //console.log(id_usuario);
    // Verificar si todos los identificadores están disponibles
    if(id_rol && id_objeto && id_usuario) {

      return this._permisosService.permisosdeRoutes(id_rol, id_objeto, id_usuario).pipe(
        map(permisos => {
          if (permisos.length > 0) {
            // Si el usuario tiene permisos, permite el acceso a la ruta
            localStorage.removeItem('id_objeto');
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
      return this.router.createUrlTree(['/dashboard/not-found']);
    }
  }
};
