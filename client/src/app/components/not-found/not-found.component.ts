import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  styles: [`
    .container {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 86.21vh;

    }
  `],
  template: `
    <div class="container">
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <hr>
      <a href="/">Go back to home</a>
    </div>
  `,

})
export class NotFoundComponent {

}
