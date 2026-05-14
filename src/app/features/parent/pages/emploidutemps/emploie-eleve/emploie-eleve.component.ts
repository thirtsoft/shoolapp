import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';
import { ParentSessionService } from '../../../service/parent-session.service';

@Component({
  selector: 'app-emploie-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './emploie-eleve.component.html',
  styleUrls: ['./emploie-eleve.component.css']
})
export class EmploieEleveComponent implements OnInit, OnDestroy {

  emploiDuTemps: any;
  errorMessage?: string;
  classeId: number;
  coursList: any;
  sizeNull?: number;

  private readonly destroy$ = new Subject<void>();


  private readonly planificationService = inject(PlanificationResourceService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly sessionService = inject(ParentSessionService);

  constructor(
  ) {
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    this.getListeEmploiDuTempsClasse();

    this.sessionService.changement$
      .pipe(takeUntil(this.destroy$))
      .subscribe((changement) => {
        if (changement && changement.classeId !== this.classeId) {
          console.log('🔄 Nouvelle classe :', changement.classeId);
          this.classeId = changement.classeId!;
          this.getListeEmploiDuTempsClasse();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getListeEmploiDuTempsClasse() {
    if (!this.classeId) return;
    this.planificationService.recupererUneResource('emploidutemps/byclasse', this.classeId).subscribe({
      next: (data) => {
        this.emploiDuTemps = data;
        console.log('Details course', this.emploiDuTemps);
        this.coursList = this.emploiDuTemps?.listeCoursDTOS;
        console.log('Details course', this.coursList);
      }

    });
    (error: any) => this.errorMessage = <any>error;
  }

}
