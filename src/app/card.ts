export class Card {
    suit: string;
    name: string;
    value: number;
    isFaceUp: boolean;

    constructor(
        private newSuit: string, 
        private newName: string,
        private newValue: number,
        ) {
            this.suit = this.newSuit;
            this.name = this.newName;
            this.value = this.newValue;
            this.isFaceUp = false;
        }
}