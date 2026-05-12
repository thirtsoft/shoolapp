import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';

@Component({
  selector: 'app-emploie-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './emploie-eleve.component.html',
  styleUrls: ['./emploie-eleve.component.css']
})
export class EmploieEleveComponent implements OnInit {

  emploiDuTemps: any;
  errorMessage?: string;
  classeId: number;
  coursList: any;
  sizeNull?: number;

  private readonly referentielService = inject(ReferentielResourceService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    this.classeId = this.localStorage.getItem('classeId');
  }

  ngOnInit(): void {
    if (this.classeId != null && this.classeId != undefined) {
      this.getListeEmploiDuTempsClasse(this.classeId);
    }
  }

  getListeEmploiDuTempsClasse(classeId: number) {
    this.referentielService.recupererUneResource('emploidutemps/byclasse', classeId).subscribe({
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
