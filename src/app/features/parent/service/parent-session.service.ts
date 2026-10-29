import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EleveResume } from '../../../core/models/dossiereleve/eleve/eleve-resume.model';
import { ParentResponse } from '../../../core/models/parent/parent-eleves-response.model';

export interface ChangementEleve {
  eleveId: number;
  classeId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ParentSessionService {

  readonly changementEleve = signal<ChangementEleve | null>(null);
  private readonly changementSubject = new BehaviorSubject<ChangementEleve | null>(null);
  readonly changement$ = this.changementSubject.asObservable();

  private readonly _listeEleves = signal<EleveResume[]>([]);
  readonly listeEleves = this._listeEleves.asReadonly();

  private readonly _eleveActif = signal<EleveResume | null>(null);

  readonly eleveActif = this._eleveActif.asReadonly();

  private readonly _parentDetails = signal<ParentResponse | null>(null);
  readonly parentDetails = this._parentDetails.asReadonly();

  private readonly ELEVE_LIST_KEY = 'parent_eleves';
  private readonly ELEVE_ACTIF_KEY = 'parent_eleve_actif';
  private readonly PARENT_DETAILS_KEY = 'parent_details';

  constructor() {
    this.restaurerSession();
  }

  initialiserEleves(eleves: EleveResume[]): void {
    this._listeEleves.set(eleves);
    localStorage.setItem(this.ELEVE_LIST_KEY, JSON.stringify(eleves));
    const actifActuel = this._eleveActif();
    if (!actifActuel && eleves.length > 0) {
      this.setEleveActif(eleves[0]);
    }
  }

  changerEleve(eleveId: number, classeId?: number | null): void {
    const eleve = this._listeEleves().find(e => e.id === eleveId);
    localStorage.setItem('eleveId', String(eleveId));
    const classeIdFinal = classeId ?? eleve?.classeId ?? null;

    if (classeIdFinal != null) {
      localStorage.setItem('classeId', String(classeIdFinal));

    } else {
      localStorage.removeItem('classeId');
    }

    const changement: ChangementEleve = {
      eleveId,
      classeId: classeIdFinal
    };

    this.changementEleve.set(changement);
    this.changementSubject.next(changement);

    if (eleve) {
      this.setEleveActif(eleve);

    }
  }

  setEleveActif(eleve: EleveResume): void {
    if (eleve?.id == null) {
      return;
    }
    this._eleveActif.set(eleve);
    localStorage.setItem(this.ELEVE_ACTIF_KEY, JSON.stringify(eleve));
    localStorage.setItem('eleveId', String(eleve.id));
    if (eleve.classeId != null) {
      localStorage.setItem('classeId', String(eleve.classeId));

    } else {
      localStorage.removeItem('classeId');
    }
  }

  getEleveResume(): EleveResume | null {
    return this._eleveActif();
  }

  setParentDetails(parent: ParentResponse): void {
    this._parentDetails.set(parent);
    localStorage.setItem(this.PARENT_DETAILS_KEY, JSON.stringify(parent));
  }

  getParentDetails(): ParentResponse | null {
    return this._parentDetails();
  }

  getEleveId(): number | null {
    const id = localStorage.getItem('eleveId');
    if (!id) {
      return null;
    }

    const parsedId = Number(id);

    return Number.isNaN(parsedId) ? null : parsedId;
  }

  getClasseId(): number | null {
    const id = localStorage.getItem('classeId');
    if (!id) {
      return null;
    }

    const parsedId = Number(id);

    return Number.isNaN(parsedId) ? null : parsedId;
  }

  private restaurerSession(): void {
    const parentJson = localStorage.getItem(this.PARENT_DETAILS_KEY);
    if (parentJson) {
      try {
        const parent: ParentResponse = JSON.parse(parentJson);
        this._parentDetails.set(parent);

      } catch (error) {
        console.error('❌ Erreur restauration informations parent', error);
        localStorage.removeItem(this.PARENT_DETAILS_KEY);
      }
    }

    const elevesJson = localStorage.getItem(this.ELEVE_LIST_KEY);

    if (elevesJson) {
      try {
        const eleves: EleveResume[] = JSON.parse(elevesJson);
        this._listeEleves.set(eleves);

      } catch (error) {
        console.error('❌ Erreur restauration liste élèves', error);
        localStorage.removeItem(this.ELEVE_LIST_KEY);
      }
    }

    const actifJson = localStorage.getItem(this.ELEVE_ACTIF_KEY);

    if (actifJson) {

      try {
        const eleve: EleveResume = JSON.parse(actifJson);

        const eleveExiste = this._listeEleves().find(e => e.id === eleve.id);
        if (eleveExiste) {
          this._eleveActif.set(eleveExiste);

        } else {
          localStorage.removeItem(this.ELEVE_ACTIF_KEY);
        }

      } catch (error) {
        console.error('❌ Erreur restauration élève actif', error);

        localStorage.removeItem(this.ELEVE_ACTIF_KEY);
      }
    }

    if (!this._eleveActif()) {
      const savedEleveId = localStorage.getItem('eleveId');
      if (savedEleveId) {
        const eleve = this._listeEleves().find(e => e.id === Number(savedEleveId));
        if (eleve) {
          this._eleveActif.set(eleve);
        }
      }
    }
  }

  clear(): void {
    this._listeEleves.set([]);

    this._eleveActif.set(null);

    this._parentDetails.set(null);

    this.changementEleve.set(null);

    this.changementSubject.next(null);

    localStorage.removeItem(this.ELEVE_LIST_KEY);
    localStorage.removeItem(this.ELEVE_ACTIF_KEY);
    localStorage.removeItem(this.PARENT_DETAILS_KEY);
    localStorage.removeItem('eleveId');
    localStorage.removeItem('classeId');
  }
}
