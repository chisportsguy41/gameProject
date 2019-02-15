import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DeckService } from '../deck.service';
import { Card } from '../card';
import { Deck } from '../deck';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  deck: Deck = new Deck();
  shoes: number;

  constructor (private deckService: DeckService) {}

  ngOnInit() {
    this.shoes = Math.floor(Math.random()*8) + 1;
    this.load(this.shoes);
  }

  load(shoeSize:number): void {
    this.deckService.load(shoeSize).subscribe(
      (response:any) =>{
        console.log(response);
        this.deck = response;
      });
  }

  shuffle(deck: Deck): void {
    this.deckService.shuffle(this.deck).subscribe(
      (response:any)=>{
        console.log(response)
        this.deck = response;
      }
    )
  }

}
