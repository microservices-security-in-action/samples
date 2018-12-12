import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent {

  title = 'Demo';
  greeting = {};
  orders = {};

  constructor(private app: AppService, private http: HttpClient) {
     http.get('http://localhost:9000/orders').subscribe(data => this.orders = data);
  }

  authenticated() { return this.app.authenticated; }

}
