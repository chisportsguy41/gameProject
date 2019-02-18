import { Card } from './card';

export class Deck {
    cards: Array<Card> = [];
    isLoaded: boolean = false;
    isShuffled: boolean = false;
}