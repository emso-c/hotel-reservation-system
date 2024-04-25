import { AbstractControl } from "@angular/forms";

export function maxPriceValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const minPrice = control.root.get('minPrice');
  const maxPrice = control.value;
  if (minPrice && maxPrice && maxPrice <= minPrice.value) {
    return { 'greaterThan': true };
  }
  return null;
}

export function numberValidator(control: AbstractControl): { [key: string]: any } | null {
  if (isNaN(control.value)) {
    return { 'number': 'Value must be a number.' };
  }
  return null;
}

export function stringValidator(control: AbstractControl): { [key: string]: any } | null {
  if (typeof control.value !== 'string') {
    return { 'string': 'Value must be a string.' };
  }
  return null;
}

export function passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
  const password = control.root.get('password');
  const passwordConfirm = control.value;
  if (password && passwordConfirm && passwordConfirm !== password.value) {
    return { 'passwordMatch': 'Passwords do not match.' };
  }
  return null;
}

export function passwordValidator(control: AbstractControl): { [key: string]: any } | null {
  if (!control.value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)) {
    return { 'password': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.' };
  }
  if (control.value.length < 8) {
    return { 'password': 'Password must be at least 8 characters long.' };
  }
  if (!control.value.match(/[a-z]/)) {
    return { 'password': 'Password must contain at least one lowercase letter.' };
  }
  return null;
}