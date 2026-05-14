import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChangementEleve {
  eleveId: number;
  classeId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ParentSessionService {

  readonly changementEleve = signal<ChangementEleve | null>(null);

  // Observable pour les composants qui préfèrent subscribe
  private readonly changementSubject = new BehaviorSubject<ChangementEleve | null>(null);
  changement$: Observable<ChangementEleve | null> = this.changementSubject.asObservable();

  constructor() {
    const savedEleveId = localStorage.getItem('eleveId');
    const savedClasseId = localStorage.getItem('classeId');

    if (savedEleveId) {
      const changement: ChangementEleve = {
        eleveId: Number(savedEleveId),
        classeId: savedClasseId ? Number(savedClasseId) : null
      };
      this.changementEleve.set(changement);
      this.changementSubject.next(changement);
    }
  }

  changerEleve(eleveId: number, classeId?: number): void {
    localStorage.setItem('eleveId', String(eleveId));

    if (classeId != null) {
      localStorage.setItem('classeId', String(classeId));
    }

    const changement: ChangementEleve = {
      eleveId,
      classeId: classeId ?? null
    };

    this.changementEleve.set(changement);
    this.changementSubject.next(changement);
  }

  getEleveId(): number | null {
    const id = localStorage.getItem('eleveId');
    return id ? Number(id) : null;
  }

  getClasseId(): number | null {
    const id = localStorage.getItem('classeId');
    return id ? Number(id) : null;
  }

}