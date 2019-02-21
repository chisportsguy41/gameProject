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
  botNames: Array<string> = ['Trish', 'Kandis', 'Glinda', 'Val', 'Romelia', 'Almeta',
  'Deloise', 'Joanie', 'Ayana', 'Jerrell', 'Heidi', 'Julian', 'Aisha', 'Curt', 
  'Merlyn', 'Johnny', 'Lorretta', 'Mirella', 'Ann', 'Wendi'];

  winnerMessage: string;

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
    for (var i = 0; i < 3; i++){
      let rand = Math.floor(Math.random()*this.botNames.length);
      this.players.push(new Player(this.botNames[rand]));
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
    console.log(this.player);
    console.log(this.players);
    console.log(this.dealer);
    console.log(this.deck);
  }

  hit(player:Player): void {
    if (player.totalValue < 21) {
      this.playerService.deal(player, this.deck, 1);
      console.log(player);
    } else if (player.totalValue == 21){
      alert("You're an idiot. You won, stop trying to hit on 21.")
    } else {
      alert("You've already busted!");
    }
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
      } else if (this.dealer.isNext == true) {
        this.playerService.setTurn(this.dealer);
      }

      if (!this.player.isTurn) {
        var that = this;
        setTimeout(function() {
          that.playForCPU();
        }, 2000);
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
      this.endGame();
      return;
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

  endGame(): void {
    if (this.game.gameType == 'blackjack') {
      let target = this.dealer.totalValue;
      let winners: Array<string> = [];
      if (target == 21) {
        winners.push(this.dealer.name);
      } else if (target > 21) {
        if (this.player.totalValue <= 21) {
          winners.push(this.player.name);
        }
        for (let player of this.players) {
          if (player.totalValue <= 21) {
            winners.push(player.name);
          }
        }
      } else if (target < 21) {
        if (this.player.totalValue <= 21 && this.player.totalValue > target) {
          winners.push(this.player.name);
        }
        for (let player of this.players) {
          if (player.totalValue <= 21 && player.totalValue > target) {
            winners.push(player.name);
          }
        }
        if (winners.length == 0) {
          winners.push(this.dealer.name);
        }
      }
      this.winnerMessage = 'Congratulations! ' + winners.join(', ') + ' won!';
      console.log(this.winnerMessage);
    }
    
  }

  reset(): void {
    this.winnerMessage = null;
    this.deck = new Deck();
    this.load(this.game.shoes);
    let money = this.player.money;
    let name = this.player.name;
    this.player = new Player(name);
    this.player.money = money;
    name = this.dealer.name;
    this.dealer = new Player(name);
    this.players = [];
    for (var i = 0; i < 3; i++){
      let rand = Math.floor(Math.random()*this.botNames.length);
      this.players.push(new Player(this.botNames[rand]));
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

  playForCPU(): void {
    var that = this;
    if (this.dealer.isTurn){
      if (this.dealer.totalValue < 16) {
        this.hit(this.dealer);
        setTimeout(function() {
          that.playForCPU();
        }, 2000);
      } else {
        this.endTurn();
      }
    } else {
      for (let player of this.players) {
        if (player.isTurn) {
          if (player.totalValue < 16) {
            this.hit(player);
            setTimeout(function() {
              that.playForCPU();
            }, 2000);
          } else if (player.totalValue > 16 && player.totalValue < 21) {
            var r = Math.floor(Math.random()*100);
            if (r <= 50) {
              this.hit(player);
              setTimeout(function() {
                that.playForCPU();
              }, 2000);
            } else {
              this.endTurn();
            }
          } else {
            this.endTurn();
          }
        }
      }
    }
  }

}