import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {

  list_productos: any[]=[];
  list_categorias: any[]=[];
  list_paises: any[]=[];
  list_ciudades: any[]=[];

  
  constructor(){}

  ngOnInit(): void {
  };

  getOpProductos(){
  };
}





