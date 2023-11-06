import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  menuItems:any[];
  userName: string = '';

  constructor(private _sideBarService: SidebarService, private router:Router){
    this.menuItems = this._sideBarService.menu;
    //this.menuItems2 = this.sideBarService.empresas;
  }

  ngOnInit(): void {
    this.menuItems = this._sideBarService.menu;
    const local = localStorage.getItem('usuario');
    if(local !== null){
      this.userName = local;
    };
  }

  logout(){
    this.router.navigateByUrl('/login');
    localStorage.clear();
  }
}
