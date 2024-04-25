import { FormGroup } from "@angular/forms";

export function isValid(form: FormGroup, control: string) {
  if (!form.controls[control]) {
    return false;
  }
  return form.controls[control].valid;
}
export function getFormClass(form: FormGroup, control: string) {
  const formControl = form.controls[control];
  if (!formControl) {
    return {};
  }
  const isTouched = formControl.dirty || formControl.touched
  const isValid = formControl.valid;
  return {
    'is-invalid': !isValid && isTouched,
    'is-valid': isValid && isTouched
  };
}