import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateformatService {

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
}