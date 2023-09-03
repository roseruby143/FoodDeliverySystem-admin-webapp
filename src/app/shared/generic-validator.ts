import { FormGroup, AbstractControl } from '@angular/forms';

// Generic validator for Reactive forms
// Implemented as a class, not a service, so it can retain state for multiple forms.
// NOTE: This validator does NOT support validation of controls or groups within a FormArray.
export class GenericValidator {

  // Provide the set of valid validation messages
  // Stucture:
  // controlName1: {
  //     validationRuleName1: 'Validation Message.',
  //     validationRuleName2: 'Validation Message.'
  // },
  // controlName2: {
  //     validationRuleName1: 'Validation Message.',
  //     validationRuleName2: 'Validation Message.'
  // }
  constructor(private validationMessages: { [key: string]: { [key: string]: string } }) {

  }

  // Processes each control within a FormGroup
  // And returns a set of validation messages to display
  // Structure
  // controlName1: 'Validation Message.',
  // controlName2: 'Validation Message.'
  processMessages(container: FormGroup): { [key: string]: string } {
    const messages:any = {};
    for (const controlKey in container.controls) {
        //console.log(`---- container.controls.hasOwnProperty(controlKey) : ${container.controls.hasOwnProperty(controlKey)}`);
      if (container.controls.hasOwnProperty(controlKey)) {
        const c = container.controls[controlKey];
        // If it is a FormGroup, process its child controls.
        if (c instanceof FormGroup) {
          if(c.controls!['confirmEmail'] && c.errors && c.errors!['match'])
            c.controls['confirmEmail'].setErrors({'match':true});
            //console.log(`------ childMessages : ${c}`);
          const childMessages = this.processMessages(c);
          Object.assign(messages, childMessages);
        } else {
            //console.log(`------ this.validationMessages[controlKey] : ${JSON.stringify(this.validationMessages[controlKey])}`);
          
          // Only validate if there are validation messages for the control
          if (this.validationMessages[controlKey]) {
            messages[controlKey as keyof {}] = '';
            //console.log(`(c.errors : ${JSON.stringify(c.errors)}`)
            if ((c.dirty || c.touched) && c.errors) {
              Object.keys(c.errors).map(messageKey => {
                if (this.validationMessages[controlKey][messageKey]) {
                  messages[controlKey] += this.validationMessages[controlKey][messageKey] + ' ';
                  //console.log(`------ messages[${controlKey}] : ${JSON.stringify(this.validationMessages[controlKey][messageKey] + ' ')}`);
                }
              });
            }
        }
        }
      }
    }
    //console.log(`------ messages : ${JSON.stringify(messages)}`);
    return messages;
  }

  /* getErrorCount(container: FormGroup): number {
    let errorCount = 0;
    for (const controlKey in container.controls) {
      if (container.controls.hasOwnProperty(controlKey)) {
        if (container.controls[controlKey].errors) {
          errorCount += Object.keys(container.controls[controlKey as keyof {}].errors).length;
          //console.log(errorCount);
        }
      }
    }
    return errorCount;
  } */
}