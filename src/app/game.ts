export class Game {
    id: string;
    gameType: string;
    pot: number = 0;
    shoes: number;
    players: number;
    name: string;
    type: string;
    protected: boolean;
    password: string;
    hasStarted: boolean = false;
}