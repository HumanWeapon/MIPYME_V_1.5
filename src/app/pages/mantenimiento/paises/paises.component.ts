import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Paises } from 'src/app/interfaces/empresa/paises';
import { PaisesService } from 'src/app/services/empresa/paises.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-paises',
  templateUrl: './paises.component.html',
  styleUrls: ['./paises.component.css']
})
export class PaisesComponent implements OnInit{
  listPaises: Paises[] = [];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(
    private _paisesService: PaisesService,
    private _toastr: ToastrService,
    private _errorService: ErrorService){}

  ngOnInit(): void {
    this.getAllPaises();
  }
  getAllPaises(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: {url:'//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'},
      responsive: true
    };
    this._paisesService.getAllPaises().subscribe((res: any) =>{
      this.listPaises = res;
      this.dtTrigger.next(0);
    })
  }
  addPais(){}
}
