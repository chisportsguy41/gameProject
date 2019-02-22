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
  startingBet: number = 1000;

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
      this.bet(this.player, this.startingBet);
      for (let player of this.players) {
        this.bet(player, this.startingBet);
      }
    } else {
      this.deal(5);
    }
    this.player.isNext = true;
    this.setTurn();
  }

  load(shoeSize:number): void {
    this.deckService.load(this.deck, shoeSize);
    if (shoeSize == 1) {
      this.deckService.flipAll(this.deck);
    }
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
    if (player.totalValue < 21 && (player.hand.length == 2 || !player.hasDoubledDown)) {
      this.playerService.deal(player, this.deck, 1);
      console.log(player);
    } else if (player.totalValue == 21){
      alert("You're an idiot. You won, stop trying to hit on 21.")
    } else if (player.hand.length > 2 && player.hasDoubledDown) {
      alert("Doubling down means you can only receive one extra card.")
    } else {
      alert("You've already busted!");
    }
  }

  bet(bettor: Player, amount:number): void {
    bettor.money -= amount;
    bettor.bet += amount;
    console.log(bettor.name + ': ' + bettor.money);
    console.log(bettor.name + ': ' + bettor.bet);
  }

  doubleDown(bettor: Player): void {
    if (bettor.money > bettor.bet){
      if (bettor.totalValue > 8 && bettor.totalValue < 12 && !bettor.hasSplit && !bettor.hasDoubledDown && bettor.hand.length == 2){
        bettor.money -= bettor.bet;
        bettor.bet += bettor.bet;
        bettor.hasDoubledDown = true;
      } else {
        alert("You cannot double down on that hand.");
      }
    } else {
      alert("You do not have enough money to double down.");
    }
  }

  split(player: Player): void {
    if(player.hand.length == 2 && player.hand[0].name === player.hand[1].name) {
      if(!player.hasSplit) {
        player.hasSplit = true;
        player.splitBet = player.bet;
        player.money -= player.splitBet;
        this.playerService.split(player, this.deck);
      } else {
        alert("You have already split your cards.");
      }
    } else {
      alert("Your cards do not match.");
    }
    
    console.log(player);

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

      /*if (!this.player.isTurn) {
        var that = this;
        setTimeout(function() {
          that.playForCPU();
        }, 2000);
      }*/
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
      if (this.dealer.hasBlackjack) {
        winners.push(this.dealer.name);
        if (this.player.hasBlackjack) {
          this.player.money += this.player.bet;
        }
        for (let player of this.players) {
          if (player.hasBlackjack) {
            player.money += player.bet;
          }
        }
      } else if (target == 21 && !this.dealer.hasBlackjack) {
        winners.push(this.dealer.name);
        if (this.player.hasBlackjack) {
          this.player.money += (this.player.bet * 1.5);
        }
        for (let player of this.players) {
          if (player.hasBlackjack) {
            player.money += (player.bet * 1.5);
          }
        }
      } else if (target > 21) {
        if (this.player.totalValue <= 21) {
          winners.push(this.player.name);
          this.player.money += (this.player.bet *2);
        }
        for (let player of this.players) {
          if (player.totalValue <= 21) {
            winners.push(player.name);
            player.money += (player.bet * 2);
          }
        }
      } else if (target < 21) {
        if (this.player.totalValue <= 21 && this.player.totalValue > target) {
          winners.push(this.player.name);
          this.player.money += (this.player.bet *2);
        } else if (this.player.totalValue == target) {
          this.player.money += this.player.bet;
        }
        for (let player of this.players) {
          if (player.totalValue <= 21 && player.totalValue > target) {
            winners.push(player.name);
            player.money += (player.bet * 2);
          } else if (player.totalValue == target) {
            player.money += player.bet;
          }
        }
        if (winners.length == 0) {
          winners.push(this.dealer.name);
        }
      }
      this.winnerMessage = 'Congratulations! ' + winners.join(', ') + ' won!';
      console.log(this.player);
      console.log(this.players);
    }
    
  }

  reset(): void {
    this.winnerMessage = null;
    this.deck = new Deck();
    this.load(this.game.shoes);
    let money = this.player.money;
    if (money == 0) {
      alert("You are out of money. Thanks for playing!");
      return;
    }
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
      this.bet(this.player, this.startingBet);
      for (let player of this.players) {
        this.bet(player, this.startingBet);
      }
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
            if(player.totalValue > 8 && player.totalValue < 12 && player.hand.length == 2){
              this.doubleDown(player);
              this.hit(player);
              this.endTurn();
            } else {
              this.hit(player);
              setTimeout(function() {
                that.playForCPU();
              }, 2000);
            }
          } else if (player.totalValue >= 16 && player.totalValue < 21) {
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