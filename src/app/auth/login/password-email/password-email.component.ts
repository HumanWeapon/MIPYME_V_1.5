import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-password-email',
  templateUrl: './password-email.component.html',
  styleUrls: ['./password-email.component.css']
})
export class PasswordEmailComponent {

  constructor(
    private router: Router,
    private _toastr: ToastrService,

    ) {}

    ngOnInit(): void {

    }

    onReset(){
      console.log('envio de correo')
    }

    navigateMetodo() {
      this.router.navigate(['/metodo'])
    }
  


}
