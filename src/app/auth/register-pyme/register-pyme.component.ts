import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-pyme',
  templateUrl: './register-pyme.component.html',
  styleUrls: ['./register-pyme.component.css']
})
export class RegisterPymeComponent {

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/loginpyme']);
  }
}
