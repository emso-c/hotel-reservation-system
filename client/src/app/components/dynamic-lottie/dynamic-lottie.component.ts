import { Component, Input } from '@angular/core';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-dynamic-lottie',
  standalone: true,
  imports: [LottieComponent],
  templateUrl: './dynamic-lottie.component.html',
  styleUrl: './dynamic-lottie.component.css'
})
export class DynamicLottieComponent {
  @Input() file: string = 'loading';
  options: AnimationOptions = {
    path: `/assets/animations/${this.file}.json`,
  }

  ngOnChanges() {
    console.log('file', this.file);
    this.options = {
      path: `/assets/animations/${this.file}.json`,
    }
  }
}
