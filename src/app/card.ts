export class Card {
    suit: string;
    name: string;
    value: number;
    isFaceUp: boolean;

    constructor(
        suit: string, 
        name: string,
        value: number,
        ) {
            this.suit = suit;
            this.name = name;
            this.value = value;
            this.isFaceUp = true;
        }
}