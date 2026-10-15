import { effect, Injectable, signal } from '@angular/core';

export interface EnseignementItem {
  id: string | number;
  classe: string;
  classId: number;
  matiere?: string;
  anneeScolaire: string;
  dateDebut?: string;
  enseignementId?: number;
}

export interface ClasseItem {
  id: string;
  label: string;
}

export interface GestionClasseContext {
  classId?: number;
  classe?: string;
  matiere?: string;
  anneeScolaire?: string;
  enseignementId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EnseignementContextService {

  private readonly GESTION_CLASSE_KEY = 'gestion_classe_context';

  mesClasses = signal<EnseignementItem[]>([]);
  private readonly contexteGestionClasse = signal<GestionClasseContext | null>(this.loadGestionClasseContext());

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

    effect(() => {
      const context = this.contexteGestionClasse();

      if (context) {
        sessionStorage.setItem(this.GESTION_CLASSE_KEY, JSON.stringify(context));
      } else {
        sessionStorage.removeItem(this.GESTION_CLASSE_KEY);
      }
    });
  }

  setClasses(classes: EnseignementItem[]): void {
    this.mesClasses.set(classes);
    if (!this.activeClasseId() && classes.length > 0) {
      this.activeClasseId.set(String(classes[0].classId));
    }
  }

  setGestionClasseContext(context: GestionClasseContext): void {
    this.contexteGestionClasse.set(context);
  }

  getGestionClasseContext(): GestionClasseContext | null {
    return this.contexteGestionClasse();
  }

  clearGestionClasseContext(): void {
    this.contexteGestionClasse.set(null);
  }

  private loadGestionClasseContext(): GestionClasseContext | null {

    const storedContext = sessionStorage.getItem(this.GESTION_CLASSE_KEY);

    if (!storedContext) {
      return null;
    }

    try {
      return JSON.parse(storedContext) as GestionClasseContext;
    } catch (error) {
      console.error('Impossible de récupérer le contexte gestion-classe', error);

      sessionStorage.removeItem(this.GESTION_CLASSE_KEY);

      return null;
    }
  }
}