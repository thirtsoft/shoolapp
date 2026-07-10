import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionSemestreAddEdit } from '../../../../../../core/models/referentiels/session-semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-session-semestre-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './create-session-semestre-component.html',
  styleUrl: './create-session-semestre-component.css',
})
export class CreateSessionSemestreComponent implements OnInit {

  errorMessage?: string;
  semestreId: number;
  sessionSemestreFormGroup!: FormGroup;
  sessionSemestre: any;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;

  utilisateur: Utilisateur = {};

  semestreList: Semestre[] = [];
  anneeScolaireList: AnneeScolaire[] = [];

  title = "Ajouter un session semestre";

  private readonly referentielService = inject(ReferentielResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.semestreId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getSemestreList();
    this.getAnneeScolaireList();
    this.initializeForm(null);
  }

  initializeForm(semestre: SessionSemestreAddEdit | null) {
    this.sessionSemestreFormGroup = this._formBuilder.group({
      id: [semestre?.id ?? ''],
      semestre: [semestre?.semestre ?? '', Validators.required],
      anneeScolaireId: [semestre?.anneeScolaireId ?? '', Validators.required],
      dateDebut: [semestre?.dateDebut ?? '', Validators.required],
      dateFin: [semestre?.dateFin ?? ''],
    });
  }


  getAnneeScolaireList() {
    this.referentielService.getResourceList('anneescolaire').subscribe({
      next: (data: any) => {
        this.anneeScolaireList = data;
      }
    });
  }

  getSelectedAnneeScolaire(): string {
    const anneeScolaireId = this.sessionSemestreFormGroup.get('anneeScolaireId')?.value;
    const anneeScolaire = this.anneeScolaireList.find(c => Number(c.id) === Number(anneeScolaireId));
    return anneeScolaire?.libelle || '';
  }


  getSemestreList() {
    this.referentielService.getResourceList('semestre').subscribe({
      next: (data: any) => {
        this.semestreList = data;
      }
    });
  }

  getSelectedSemestre(): string {
    const semestreId = this.sessionSemestreFormGroup.get('semestre')?.value;
    const semestre = this.semestreList.find(c => Number(c.id) === Number(semestreId));
    return semestre?.libelle || '';
  }


  ajoutSessionSemestre() {
    const payload = this.sessionSemestreFormGroup.value;
    payload.ecole = this.ecoleId;
    this.referentielService.creerUneRessource('sessionsemestre', payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'La sessionsemestre  a été enregistrées avec succès !!! ');
          this.goBack();
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    });
  }

  goBack() {
    this.router.navigate(['admin/referentiel/sessions']);
  }

}

