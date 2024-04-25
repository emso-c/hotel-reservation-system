import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  styles: [`
    .footer {
      background-color: #333;
      color: white;
      text-align: center;
      width: 100%;
      /* position: sticky; */
      bottom: 0;
    }

    .footer a {
      color: white;
    }

    .footer a:hover {
      color: #ccc;
    }

    .footer p {
      margin: 0;
    }
  `],
  template: `
    <div class="footer">
      <p>Hotel Reservation System</p>
      <p>All rights reserved &copy; 2024</p>
    </div>
  `
})
export class FooterComponent {

}
