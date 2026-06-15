import { effect, Injectable, signal } from '@angular/core';

export interface EnseignementItem {
  id: string | number;
  classe: string;
  classId: number;
  matiere?: string;
  anneeScolaire: string;
  dateDebut?: string;
}

export interface ClasseItem {
  id: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnseignementContextService {

  mesClasses = signal<EnseignementItem[]>([]);

  activeClasseId = signal<string | null>(localStorage.getItem('active_classe_id'));

  constructor() {
    effect(() => {
      const id = this.activeClasseId();
      if (id) {
        localStorage.setItem('active_classe_id', id);
      } else {
        localStorage.removeItem('active_classe_id');
      }
    });
  }

  setClasses(classes: EnseignementItem[]) {
    this.mesClasses.set(classes);

    if (!this.activeClasseId() && classes.length > 0) {
      this.activeClasseId.set(String(classes[0].classId));
    }
  }

}