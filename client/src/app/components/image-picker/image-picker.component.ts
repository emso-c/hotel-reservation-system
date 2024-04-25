import { Component, Renderer2, ViewChild, ElementRef, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-image-picker',
  standalone: true,
  template: `
    <div class="image-picker" (click)="openFilePicker()">
      <img
        [src]="selectedImage || placeholderImage"
        class="image-preview"
        [class.placeholder]="!selectedImage"
      >
      <input
        #fileInput
        type="file"
        accept="image/*"
        (change)="handleImageChange($event)"
        name="img"
        id="img-picker"
        hidden
      >
    </div>
  `,
  styleUrls: ['./image-picker.component.css']
})
export class ImagePickerComponent implements OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() imageUrl: string | undefined | null;

  placeholderImage = 'https://www.drupal.org/files/issues/default-avatar.png';
  selectedImage: string | undefined;

  constructor(private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageUrl'] && this.imageUrl) {
      this.selectedImage = this.imageUrl;
    }
  }

  openFilePicker() {
    this.renderer.selectRootElement(this.fileInput.nativeElement).click();
  }

  handleImageChange(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      this.newImgEvent.emit(selectedFile);

      // Display the selected image in the preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  @Output() newImgEvent = new EventEmitter<File>();
}
