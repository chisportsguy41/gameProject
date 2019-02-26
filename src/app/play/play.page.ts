import { Component } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { ToastController } from '@ionic/angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs';

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
  player: Player;
  dealer: Player = new Player('The House');
  players: Array<Player> = [];
  deck: Deck = new Deck();

  winnerMessage: string;
  startingBet: number = 1000;

  message: string = '';
  messages = [];

  password: string;
  username: string = '';
  isConnected: boolean = false;
  monies: Array<number> = [];
  hasEmittedEvent: boolean = false;
  hasEnded: boolean = false;

  constructor(
    private deckService: DeckService,
    private gameService: GameService,
    private playerService: PlayerService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private socket: Socket, 
    private toastCtrl: ToastController 
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
    if (!this.game.hasStarted) {
      this.game.hasStarted = true;
      this.socket.emit('start-game', { text: 'Please start the game', number: this.game.players });
    }
    this.load(this.game.shoes);
    
  }

  load(shoeSize:number): void {
    this.deckService.load(this.deck, shoeSize);
    if (shoeSize == 1) {
      this.deckService.flipAll(this.deck);
    }
  }

  deal(number:number = 2): void {
    //this.playerService.deal(this.player, this.deck, number);
    for (let player of this.players) {
      this.playerService.deal(player, this.deck, number);
    }
    if(this.game.gameType == "blackjack") {
      this.playerService.deal(this.dealer, this.deck, number);
    }
    console.log(this.players);
    console.log(this.dealer);
    console.log(this.deck);
  }

  hit(player:Player, split: boolean = false): void {
    if (!split){
      if (player.totalValue < 21 && (player.hand.length == 2 || !player.hasDoubledDown)) {
        if (!this.hasEmittedEvent) {
          this.socket.emit('add-message', {text: 'hits', name: player.name});
          this.hasEmittedEvent = true;
        }
        this.playerService.deal(player, this.deck, 1, split);
        console.log(player);
      } else if (player.totalValue == 21) {
        alert("You're an idiot. You won, stop trying to hit on 21.")
      } else if (player.hand.length > 2 && player.hasDoubledDown) {
        alert("Doubling down means you can only receive one extra card.")
      } else {
        alert("You've already busted!");
      }
    } else {
      if (player.splitValue < 21) {
        if (!this.hasEmittedEvent) {
          this.socket.emit('add-message', {text: 'hits (split)', name: player.name});
          this.hasEmittedEvent = true;
        }
        this.playerService.deal(player, this.deck, 1, split);
        console.log(player);
      } else if (player.splitValue == 21) {
        alert("You're an idiot. You won, stop trying to hit on 21.")
      } else {
        alert("You've already busted!");
      }
    }

    this.hasEmittedEvent = false;
  }

  bet(bettor: Player, amount:number): void {
    bettor.money -= amount;
    bettor.bet += amount;
    console.log(bettor.name + ': ' + bettor.money);
  }

  doubleDown(bettor: Player): void {
    if (bettor.money > bettor.bet){
      if (bettor.totalValue > 8 && bettor.totalValue < 12 && !bettor.hasSplit && !bettor.hasDoubledDown && bettor.hand.length == 2){
        if (!this.hasEmittedEvent) {
          this.socket.emit('add-message', {text: 'doubles down', name: bettor.name});
          this.hasEmittedEvent = true;
        }
        bettor.money -= bettor.bet;
        bettor.bet += bettor.bet;
        bettor.hasDoubledDown = true;
      } else {
        alert("You cannot double down on that hand.");
      }
    } else {
      alert("You do not have enough money to double down.");
    }

    this.hasEmittedEvent = false;
  }

  split(player: Player): void {
    if(player.hand.length == 2 && player.hand[0].name === player.hand[1].name) {
      if(!player.hasSplit) {
        if (!this.hasEmittedEvent) {
          this.socket.emit('add-message', {text: 'splits', name: player.name});
          this.hasEmittedEvent = true;
        }
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
    this.hasEmittedEvent = false;
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
      /*
      if (!this.player.isTurn) {
        var that = this;
        setTimeout(function() {
          that.playForCPU();
        }, 2000);
      }*/
    }

    if (this.game.gameType == "poker") {
      for (let i = 0; i < this.players.length; i++) {
        let j = i+1;
        if (this.players[i].isNext == true && j < this.players.length){
          this.playerService.setTurn(this.players[i], this.players[j]);
          break;
        } else {
          this.playerService.setTurn(this.players[i], this.players[0]);
        }
      }
    }
  }

  endTurn(): void {
    if (this.dealer.isTurn == true){
      this.dealer.isTurn = false;
      if (!this.hasEmittedEvent) {
        this.socket.emit('add-message', {text: 'has ended the round', name: 'The Dealer'});
        this.hasEmittedEvent = true;
      } else {
        this.hasEnded = true;
      }
      this.endGame();
      return;
    } else {
      for (let player of this.players) {
        if (player.isTurn == true){
          if (!this.hasEmittedEvent) {
            this.socket.emit('add-message', {text: 'ends their turn', name: player.name});
            this.hasEmittedEvent = true;
          }
          player.isTurn = false;
          break;
        }
      }
    }
    this.hasEmittedEvent = false;
    this.setTurn();
  }

  endGame(): void {
    if (this.game.gameType == 'blackjack') {
      let target = this.dealer.totalValue;
      let winners: Array<string> = [];
      if (this.dealer.hasBlackjack) {
        winners.push(this.dealer.name);
        for (let player of this.players) {
          if (player.hasBlackjack) {
            player.money += player.bet;
          }
          if (player.splitBlackjack) {
            player.money += player.splitBet;
          }
        }
      } else if (target == 21 && !this.dealer.hasBlackjack) {
        winners.push(this.dealer.name);
        for (let player of this.players) {
          if (player.hasSplit) {
            if (player.hasBlackjack) {
              player.money += player.bet;
            }
            if (player.splitBlackjack) {
              player.money += player.splitBet;
            }
          } else if (player.hasBlackjack) {
            player.money += (player.bet * 1.5);
          }
        }
      } else if (target > 21) {
        for (let player of this.players) {
          if (player.totalValue <= 21) {
            winners.push(player.name);
            player.money += (player.bet * 2);
          }
          if (player.splitValue <= 21 && player.hasSplit) {
            winners.push(player.name + ' (split)');
            player.money += (player.splitBet *2);
          }
        }
      } else if (target < 21) {
        for (let player of this.players) {
          if (player.totalValue <= 21 && player.totalValue > target) {
            winners.push(player.name);
            player.money += (player.bet * 2);
          } else if (player.totalValue == target) {
            player.money += player.bet;
          }
          if (player.splitValue <= 21 && player.splitValue > target) {
            winners.push(player.name + ' (split)');
            player.money += (player.splitBet *2);
          } else if (player.splitValue == target) {
            player.money += player.splitBet;
          }
        }
        if (winners.length == 0) {
          winners.push(this.dealer.name);
        }
      }
      this.winnerMessage = 'Congratulations! ' + winners.join(', ') + ' won!';
      if (!this.hasEnded) {
        this.socket.emit('add-message', {text: this.winnerMessage});
      }
      

      console.log(this.winnerMessage);
      console.log(this.player);
      console.log(this.players);
    }
    
  }

  reset(): void {
    this.socket.emit('reset', {text: 'Please reset the game', number: this.game.players});
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
          if (!player.hasSplit && player.hand.length == 2 && player.hand[0].name === player.hand[1].name) {
            this.split(player);
            setTimeout(function() {
              that.playForCPU();
            }, 2000);
          } else if (player.totalValue < 16) {
            if(player.totalValue > 8 && player.totalValue < 12 && player.hand.length == 2 && !player.hasDoubledDown){
              this.doubleDown(player);
              setTimeout(function() {
                that.hit(player);
              }, 2000);
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
              if (player.hasSplit && player.splitValue < 16) {
                this.hit(player, true);
                setTimeout(function() {
                  that.playForCPU();
                }, 2000);
              } else if (player.hasSplit && player.splitValue >= 16 && player.splitValue < 21) {
                var ra = Math.floor(Math.random()*100);
                if (ra <= 50) {
                  this.hit(player, true);
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
          } else {
            if (player.hasSplit && player.splitValue < 16) {
              this.hit(player, true);
              setTimeout(function() {
                that.playForCPU();
              }, 2000);
            } else if (player.hasSplit && player.splitValue >= 16 && player.splitValue < 21) {
              var ra = Math.floor(Math.random()*100);
              if (ra <= 50) {
                this.hit(player, true);
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

  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
 
  getUsers() {
    let observable = new Observable(observer => {
      this.socket.on('users-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getStatuses() {
    let observable = new Observable(observer => {
      this.socket.on('status-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }
 
  ionViewWillLeave() {
    this.socket.disconnect();
  }
 
  async showToast(msg) {
    let toast =  await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }

  onSubmit(): void {
    if (this.username !== '' && (!this.game.protected || 
      (this.game.protected && this.game.password === this.password))) {
      this.socket.connect();
      this.player = new Player(this.username);
      this.socket.emit('set-nickname', this.username);
      this.isConnected = true;

      this.getMessages().subscribe(message => {
        let name = message['name'];
        let text = message['text'];
        if (text == 'hits') {
          for (let player of this.players) {
            if (name == player.name) {
              console.log(name + ' ' + text + '!');
              this.hasEmittedEvent = true;
              this.hit(player, false);
              break;
            }
          }
        } else if (text == 'hits (split)') {
          for (let player of this.players) {
            if (name == player.name) {
              console.log(name + ' ' + text + '!');
              this.hasEmittedEvent = true;
              this.hit(player, true);
              break;
            }
          }
        } else if (text == 'doubles down') {
          for (let player of this.players) {
            if (name == player.name) {
              console.log(name + ' ' + text + '!');
              this.hasEmittedEvent = true;
              this.doubleDown(player);
              break;
            }
          }
        } else if (text == 'splits') {
          for (let player of this.players) {
            if (name == player.name) {
              console.log(name + ' ' + text + '!');
              this.hasEmittedEvent = true;
              this.split(player);
              break;
            }
          }
        } else if (text == 'ends their turn' || text == 'has ended the round') {
          console.log(name + ' ' + text + '!');
          this.hasEmittedEvent = true;
          this.endTurn();
        } else {
          this.showToast('The game is over!');
          this.winnerMessage = text;
        }
        
      });
   
      this.getUsers().subscribe(data => {
        let user = data['user'];
        if (data['event'] === 'left') {
          this.showToast('User left: ' + user);
        } else {
          this.showToast('User joined: ' + user);
        }
      });

      this.getStatuses().subscribe(data => {
        let user = data['user'];
        let text = data['text'];
        let names = data['list'];
        if (data['event'] === 'started') {
          this.showToast(user + ' ' + text);
          this.game.hasStarted = true;
          this.start();
        } 
        if (data['event'] === 'set-players') {
          this.players = [];
          for (var i = 0; i < names.length; i++) {
            this.players.push(new Player(names[i]));
            if (this.monies[i]) {
              this.players[i].money = this.monies[i];
            }
          }
          if (this.game.gameType == "blackjack") {
            this.deal();
            this.dealer.isDealer = true;
            //this.bet(this.player, this.startingBet);
            for (let player of this.players) {
              this.bet(player, this.startingBet);
            }
          } else {
            this.deal(5);
          }
          this.players[0].isNext = true;
          this.setTurn();
        }
        if (data['event'] === 'reset') {
          this.showToast(user + ' ' + text);
          this.winnerMessage = null;
          this.deck = new Deck();
          this.load(this.game.shoes);
          /*let money = this.player.money;
          if (money == 0) {
            alert("You are out of money. Thanks for playing!");
            return;
          } */
          this.monies = [];
          for (let player of this.players) {
            this.monies.push(player.money);
          }

          if (this.game.gameType == "blackjack") {
            this.dealer = new Player('The House');
          }

          this.hasEmittedEvent = false;
          this.hasEnded = false;
        }
      });
    } else if (this.username === '') {
      alert('Please enter a username.');
    } else if (this.game.protected && this.game.password !== this.password) {
      alert('Your password is incorrect.');
    }
  }

}