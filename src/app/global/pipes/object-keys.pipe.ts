import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'objectKeys',
})
export class ObjectKeysPipe implements PipeTransform {
    transform(value): any {
        let keys = [];
        for (let key in value) {
            keys.push(key);
        }
        return keys;
    }
}
