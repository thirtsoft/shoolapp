import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse',
  standalone: true
})
export class ReversePipe implements PipeTransform {
  transform(value: any[] | null): any[] {
    if (!value) return [];
    return [...value].reverse();
  }
}