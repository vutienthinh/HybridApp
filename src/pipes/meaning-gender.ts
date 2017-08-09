import { Injectable, Pipe } from '@angular/core';

/*
  Generated class for the Reverse pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
  name: 'reverse'
})
@Injectable()
export class Reverse {
  /*
    Takes a value and makes it lowercase.
   */
   transform(value) {
     return value.slice().reverse();
   }
}
