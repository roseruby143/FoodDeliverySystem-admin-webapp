import { AbstractControl, ValidatorFn } from '@angular/forms';

export class NumberValidator {

  static range(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      if (c.value && (isNaN(c.value) || c.value < min || c.value > max)) {
        return { range: true };
      }
      return null;
    };
  }

  static price() : ValidatorFn{
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      if (c.value && (isNaN(c.value) || c.value < 0)) {
        return { price: true };
      }
      return null;
    };
  }

  static zipLengthValidator(len: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      //console.log(c.value);
      if (c.value && (isNaN(c.value) || c.value.toString().length!=len)) {
        return { pincodeLength: true };
      }
      return null;
    };
  }
}