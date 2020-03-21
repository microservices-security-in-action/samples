import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `<h1>Book List App</h1>
    <p>
      <button (click)='loadBooks()'>Load Books</button>
    </p>
      <span><div *ngFor=\"let book of books\">
        {{book.name}}
      </div></span>
  `,
  styles: []
})

export class AppComponent {  
  books: Book[];

  constructor(private http: HttpClient) {
  }

  loadBooks(){  
     this.http
      .get<Book[]>('http://localhost:8080/books')
      .subscribe(data => {this.books = data});
  }
}

interface Book {
  id: string;
  name: string;
}
