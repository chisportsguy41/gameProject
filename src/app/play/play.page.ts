import { Component } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';

import { GameService } from '../game.service';
import { Game } from '../game';
import { DeckService } from '../deck.service';
import { Deck } from '../deck';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage {
  game: Game;
  deck: Deck = new Deck();

  constructor(
    private deckService: DeckService,
    private gameService: GameService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService 
  ) { }

  ionViewWillEnter(): void {
    if(this.cookieService.check('sugar') == true) {
      this.route.params.subscribe(
        (params)=> {this.getGame(params['id']);
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getGame(id:string): void {
    this.gameService.getGame(id).subscribe(
      (response:any)=>{
        this.game = response.game;
        console.log(this.game);
      }
    );
  }

  start(): void {
    this.game.hasStarted = true;
    this.load(this.game.shoes);
  }

  load(shoeSize:number): void {
    this.deckService.load(shoeSize).subscribe(
      (response:any) =>{
        console.log(response);
        this.deck = response;
      });
  }
}