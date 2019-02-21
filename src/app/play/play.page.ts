import { Component } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';

import { GameService } from '../game.service';
import { Game } from '../game';
import { DeckService } from '../deck.service';
import { Deck } from '../deck';
import { Player } from '../player';
import { PlayerService } from '../player.service';
import { Card } from '../card';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage {
  game: Game;
  player: Player = new Player('Player 1');
  dealer: Player = new Player('Dealer');
  players: Array<Player> = [];
  deck: Deck = new Deck();

  constructor(
    private deckService: DeckService,
    private gameService: GameService,
    private playerService: PlayerService,
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
    for (var i = 0; i<this.game.players; i++){
      this.players.push(new Player());
    }
    if (this.game.gameType == "blackjack") {
      this.deal();
      this.dealer.isDealer = true;
    } else {
      this.deal(5);
    }
    this.player.isNext = true;
    this.setTurn();
  }

  load(shoeSize:number): void {
    this.deckService.load(this.deck, shoeSize);
  }

  deal(number:number = 2): void {
    this.playerService.deal(this.player, this.deck, number);
    for (let player of this.players) {
      this.playerService.deal(player, this.deck, number);
    }
    if(this.game.gameType == "blackjack") {
      this.playerService.deal(this.dealer, this.deck, number);
    }
    console.log(this.deck);
  }

  hit(player:Player): void {
    this.playerService.deal(player, this.deck, 1);
    console.log(player);
    console.log(this.deck);
  }

  bet(amount:number): void {
    if(this.player.isTurn == true) {
      this.playerService.makeBet(this.player, amount);
    } else {
      for (let player of this.players) {
        if (player.isTurn == true){
          this.playerService.makeBet(player, amount);
          break;
        }
      }
    }
  }

  setTurn(): void {
    if (this.game.gameType == "blackjack") {
      if(this.player.isNext == true && this.players.length == 0) {
        this.playerService.setTurn(this.player, this.dealer);
      } else if (this.player.isNext == true) {
        this.playerService.setTurn(this.player, this.players[0]);
      } else if (this.player.isNext == false && this.dealer.isNext == false) {
        for (let i = 0; i < this.players.length; i++) {
          let j = i+1;
          if (this.players[i].isNext == true && j < this.players.length){
            this.playerService.setTurn(this.players[i], this.players[j]);
            break;
          } else if (this.players[i].isNext == true) {
            this.playerService.setTurn(this.players[i], this.dealer);
          }
        }
      } else {
        this.playerService.setTurn(this.dealer, this.player);
      }
    }

    if (this.game.gameType == "poker") {
      if (this.player.isNext == true) {
        this.playerService.setTurn(this.player, this.players[0]);
      } else {
        for (let i = 0; i < this.players.length; i++) {
          let j = i+1;
          if (this.players[i].isNext == true && j < this.players.length){
            this.playerService.setTurn(this.players[i], this.players[j]);
            break;
          } else {
            this.playerService.setTurn(this.players[i], this.player);
          }
        }
      }
    }
  }

  endTurn(): void {
    if (this.player.isTurn == true){
      this.player.isTurn = false;
    } else if (this.dealer.isTurn == true){
      this.dealer.isTurn = false;
    } else {
      for (let player of this.players) {
        if (player.isTurn == true){
          player.isTurn = false;
          break;
        }
      }
    }
    this.setTurn();
  }

  reset(): void {
    this.deck = new Deck();
    this.load(this.game.shoes);
    let money = this.player.money;
    let name = this.player.name;
    this.player = new Player(name);
    this.player.money = money;
    name = this.dealer.name;
    this.dealer = new Player(name);
    for(let player of this.players) {
      money = player.money;
      name = player.name;
      player = new Player(name);
      player.money = money;
    }

    if (this.game.gameType == "blackjack") {
      this.deal();
      this.dealer.isDealer = true;
    } else {
      this.deal(5);
    }
    this.player.isNext = true;
    this.setTurn();
  }

  flipCard(card:Card): void {
    if(card.isFaceUp == false) {
      card.isFaceUp = true;
    } else {
      card.isFaceUp = false;
    }
  }

}