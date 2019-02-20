import { Component } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { DeckService } from '../deck.service';
import { Card } from '../card';
import { Deck } from '../deck';
import { Player } from '../player';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  player: Player = new Player();
  deck: Deck = new Deck();
  shoes: number;
  dealNumber: number;

  constructor (
    private deckService: DeckService,
    private playerService: PlayerService
    ) {}

  ngOnInit() {
    this.shoes = Math.floor(Math.random()*8) + 1;
    this.load(this.shoes);
    this.dealNumber = Math.floor(Math.random()*5) + 1;
    this.player.money = 10000;
  }

  load(shoeSize:number): void {
    this.deckService.load(shoeSize).subscribe(
      (response:any) =>{
        console.log(response);
        this.deck = response;
      });
  }

  shuffle(): void {
    this.deckService.shuffle(this.deck);
    console.log(this.deck);
  }

  deal(number:number): void {
    this.playerService.deal(this.player, this.deck, number);
    console.log(this.player);
    console.log(this.deck);
  }

  bet(amount:number): void {
    this.playerService.makeBet(this.player, amount);
    console.log(this.player.money);
  }

  flipCard(card:Card): void {
    if(card.isFaceUp == false) {
      card.isFaceUp = true;
    } else {
      card.isFaceUp = false;
    }
  }

}
