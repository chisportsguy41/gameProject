import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user: User = new User();
  errorMessage: string;

  constructor( 
    private authService: AuthService, 
    private router: Router,
    private cookieService: CookieService
  ) {  }

  ngOnInit() {
  }

  response(response): void {
    if(response.success===false) {
      this.errorMessage = response.error;
    }

    if(response.success===true) {
      let text = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for(let i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      this.cookieService.set('sugar', text, (1/24), '/game');
      window.location.href = '/game';
    }
  }

  onSubmit(): void {
    this.authService.logIn(this.user).subscribe(
      (response) => {
        this.response(response)
      }
    );
  }

}
