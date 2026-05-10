import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DetailsEleve } from '../../../../../core/models/dossiereleve/details-eleve';
import { Inscription } from '../../../../../core/models/dossiereleve/request/inscription';
import { DossierEleveService } from '../../service/dossier-eleve.service';

@Component({
  selector: 'app-details-eleve',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './details-eleve.component.html',
  styleUrls: ['./details-eleve.component.css']
})
export class DetailsEleveComponent implements OnInit {

  errorMessage?: string;
  eleveDetails?: DetailsEleve;
  eleveId?: number;

  title = "Ajouter un eleve";

  private readonly dossierEleveService = inject(DossierEleveService);
  //  private readonly localStorage = inject(LocalStorageService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly router = inject(Router);


  ngOnInit(): void {
    this.eleveId = this.activatedRouter.snapshot.params['id'];
    if (this.eleveId) {
      this.getDetailsEleve(this.eleveId);
    }
  }

  getDetailsEleve(eleveId: number) {
    this.dossierEleveService.getDetailsEleve(eleveId)
      .subscribe(res => {
        this.eleveDetails = res;
      },
        error => this.errorMessage = <any>error);
  }

  ajouterPatient() {
    this.router.navigate(['/admin/patients/create']);
  }

  editerPatient(patientId: number) {
    this.router.navigate(['/admin/patients/edit', patientId]);
  }

  voirDetailPatient(patientId: number) {
    this.router.navigate(['/admin/patients/details', patientId]);
  }

  imprimerFiche(inscription: Inscription) { }

  images = [
    {
      path: 'assets/img/features/feature-01.jpg',
    },
    {
      path: 'assets/img/features/feature-02.jpg',
    },
    {
      path: 'assets/img/features/feature-03.jpg',
    },
    {
      path: 'assets/img/features/feature-04.jpg',
    },
  ];

  addFav() { }

  displayList(items: any[], prop: string) {
    return items?.map(item => item[prop]).join(', ')
  }

}

