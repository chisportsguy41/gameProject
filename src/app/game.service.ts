import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from './game';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game: Game;
  private url: string;

  constructor(private http: HttpClient) { 
    let l = window.location;
    let host: string;
    if(l.port >= '8100'){
      host = 'localhost:3000';
    }else{
      host = l.hostname + ((l.port.length>0)?':' + l.port:'');
    }
    this.url = `${l.protocol}//${host}/api/auth/`;
  }

  getGame(id:string): Observable<Game> {
    return this.http.get<Game>(this.url + id);
  }

  createGame(game:Game): Observable<Game> {
    return this.http.post<Game>(this.url, game, httpOptions);
  }

  deleteGame(id:string): Observable<any> {
    return this.http.delete<Game>(this.url + id);
  }

}
