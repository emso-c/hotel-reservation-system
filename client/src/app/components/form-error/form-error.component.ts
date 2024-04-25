import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.css', '../../shared/styles/auth.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FormErrorComponent {
  @Input() control!: AbstractControl;
  @Input() data!: { [key: string]: string };
  @Input() title!: string;
  constructor() { }
}
