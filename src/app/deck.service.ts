import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Card } from './card';
import { Deck } from './deck';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  deck: Deck = new Deck();
  names: Array<string> = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King'];
  suits: Array<string> = ['Hearts','Diamonds','Spades','Clubs'];
  values: Array<number> = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
  cards: Array<Card>;

  constructor() { 
    
  }

  load(deck: Deck, shoeSize:number = 1): void {
    for(let i = 0; i < shoeSize; i++) {
      for (let s = 0; s < this.suits.length; s++) {
        for (let n = 0; n < this.names.length; n++) {
          deck.cards.push(new Card(this.suits[s], this.names[n], this.values[n]));
        }
      }
    }
    deck.isLoaded = true;
    this.shuffle(deck);
  }

  shuffle(deck: Deck): void {
    var j, x, i;
    for (i = deck.cards.length-1; i>0; i--) {
      j = Math.floor(Math.random() * (i+1));
      x = deck.cards[i];
      deck.cards[i] = deck.cards[j];
      deck.cards[j] = x;
    }
    deck.isShuffled = true;
  }
}
