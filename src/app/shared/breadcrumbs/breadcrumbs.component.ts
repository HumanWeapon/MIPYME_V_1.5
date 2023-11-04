import { Component } from '@angular/core';
import { ActivationEnd, Router, Event, NavigationStart } from '@angular/router'; // Importa Event y NavigationStart

import { filter, map } from 'rxjs/operators'; // Importa 'rxjs/operators' para usar el operador 'filter'


@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent {
  public titulo: string = '';
  constructor(private _router: Router) {
    this._router.events
      .pipe(
        filter((event: Event): event is ActivationEnd => event instanceof ActivationEnd), // Comprobación de tipo más específica
        filter((event: ActivationEnd)  => event.snapshot.firstChild === null),
        map((event: ActivationEnd) => event.snapshot.data)
      )
      .subscribe(({titulo}) => {
        this.titulo = titulo;
      });
  }
}
