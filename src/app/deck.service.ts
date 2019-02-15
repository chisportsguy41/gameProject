import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Card } from './card';
import { Deck } from './deck';
import { Cards } from './default-deck';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  deck: Deck = new Deck();

  constructor() { 
    this.deck.cards = [];
    this.deck.isShuffled = false;
  }

  load(shoeSize:number = 1): Observable<Deck> {
    for (let i = 0; i < shoeSize; i++){
      for (let card of Cards) {
        this.deck.cards.push(card);
      }
    }
    return of(this.deck);
  }

  shuffle(deck: Deck): Observable<Deck> {
    var j, x, i;
    for (i = deck.cards.length-1; i>0; i--) {
      j = Math.floor(Math.random() * (i+1));
      x = deck.cards[i];
      deck.cards[i] = deck.cards[j];
      deck.cards[j] = x;
    }
    deck.isShuffled = true;
    return of(deck);
  }
}
