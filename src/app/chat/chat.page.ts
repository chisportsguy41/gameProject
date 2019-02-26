import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  messages = [];
  nickname = '';
  message = '';
 
  constructor( 
    private route: ActivatedRoute, 
    private socket: Socket, 
    private toastCtrl: ToastController
  ) {  }

  ionViewDidEnter(): void {
    this.route.params.subscribe(
      (params)=> {
        this.nickname = params['nickname'];
    });

    this.getMessages().subscribe(message => {
      this.messages.push(message);
    });
 
    this.getUsers().subscribe(data => {
      let user = data['user'];
      if (data['event'] === 'left') {
        this.showToast('User left: ' + user);
      } else {
        this.showToast('User joined: ' + user);
      }
    });
  }
 
  sendMessage() {
    this.socket.emit('add-message', { text: this.message });
    this.message = '';
  }
 
  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }
 
  getUsers() {
    let observable = new Observable(observer => {
      this.socket.on('users-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }
 
  ionViewWillLeave() {
    this.socket.disconnect();
  }
 
  async showToast(msg) {
    let toast =  await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
}
