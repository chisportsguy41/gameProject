import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {
  errors: Array<any> = [];
  errorMessage: string;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.logOut();
  }
 
  logOut(): void {
    this.authService.logOut().subscribe(
      (response: any) => {
        this.router.navigate(['/']);
      }
    );
  }

}
