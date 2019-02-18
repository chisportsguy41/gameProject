import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from "@angular/router";

import { GameService } from '../game.service';
import { Game } from '../game';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.page.html',
  styleUrls: ['./setup.page.scss'],
})
export class SetupPage {
game: Game = new Game();
errors: any = {};
errorMessage: string;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private gameService: GameService
  ) { }

  ionViewWillEnter(): void {
    if(this.cookieService.check('sugar') == false) {
      this.router.navigate(['/login']);
    }
  }

  response(response): void {
    if(response.success===false){
      console.log(response.error.errors);
      
      if( response.error.errors.username.kind == 'required' ){
        this.errors.username = 'Please enter a username';
      }

      if( response.error.errors.kind == 'unique' ){
        this.errors.username = 'A user with the given username is already registered';
      }

      if( response.error.errors.email ){
        this.errors.email = response.error.errors.email.message;
      }
    }

    if(response.success===true) {
      this.game = new Game();
      console.log(response.game);
      //this.router.navigate(['/play', response.game._id]);
    }
  }

  onSubmit(): void {
    this.gameService.createGame(this.game).subscribe(
      (response:any)=>{
        this.response(response);
      }
    )
  }

}
