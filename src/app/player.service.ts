import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Card } from './card';
import { Deck } from './deck';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  player: Player = new Player();

  constructor() { }

  deal(player:Player, deck:Deck, num:number = 2): void {
    let cards: Array<Card> = [];
    for (var i = 0; i < num; i++) {
      cards.push(deck.cards.pop());
    }

    for (let card of cards) {
      player.totalValue += card.value;
      if(card.name == "Ace"){
        player.numAces++;
        if(player.numAces == 1 && player.totalValue < 12) {
          player.totalValue += 10;
          player.addedAce = true;
        } else if (player.numAces >= 2){
          player.totalValue += 10;
        }
      } else if(card.name == "Two") {
        player.numTwos++;
      } else if(card.name == "Three"){
        player.numThrees++;
      } else if(card.name == "Four"){
        player.numFours++;
      } else if(card.name == "Five"){
        player.numFives++;
      } else if(card.name == "Six"){
        player.numSixes++;
      } else if(card.name == "Seven"){
        player.numSevens++;
      } else if(card.name == "Eight"){
        player.numEights++;
      } else if(card.name == "Nine"){
        player.numNines++;
      } else if(card.name == "Ten"){
        player.numTens++;
      } else if(card.name == "Jack"){
        player.numJacks++;
      } else if(card.name == "Queen"){
        player.numQueens++;
      } else if(card.name == "King"){
        player.numKings++;
      }

      if(card.suit == "Spades"){
        player.numSpades++;
      } else if(card.suit == "Clubs") {
        player.numClubs++;
      } else if(card.suit == "Hearts"){
        player.numHearts++;
      } else if(card.suit == "Diamonds"){
        player.numDiamonds++;
      }

      if (player.addedAce && player.totalValue > 21 && !player.subbedAce) {
        player.totalValue -= 10;
        player.subbedAce = true;
      }

      
      player.hand.push(card);
      if (player.hand.length == 2 && player.totalValue == 21) {
        player.hasBlackjack = true;
      }
    }
  }

  setTurn(player: Player, next: Player = null): void {
    player.isNext = false;
    player.isTurn = true;
    if (next != null) {
      next.isNext = true;
    }
  }
}
