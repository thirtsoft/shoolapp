import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionSemestreAddEdit } from '../../../../../../core/models/referentiels/session-semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { ReferentielResourceService } from '../../../service/referentiel-resource.service';

export interface Etat {
  id?: number;
  code?: string;
  libelle?: string;
}

@Component({
  selector: 'app-editer-session-semestre-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './editer-session-semestre-component.html',
  styleUrl: './editer-session-semestre-component.css',
})
export class EditerSessionSemestreComponent implements OnInit {

  errorMessage?: string;
  sessionSemestreId?: number;
  sessionSemestreFormGroup!: FormGroup;
  sessionSemestre: any;
  isEdit: boolean = false;
  ecoleId: any;

  SemestreEtAnnee?: string;

  utilisateur: Utilisateur = {};

  listEtat: any = [
    { id: 8, code: 'E8', libelle: 'En cours' },
    { id: 14, code: 'E14', libelle: 'A venir' },
    { id: 12, code: 'E12', libelle: 'Clôturé' }
  ];

  title = "Ajouter un semestre";

  private readonly referentielService = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.sessionSemestreId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.initializeForm(null);
    if (this.sessionSemestreId != null && this.sessionSemestreId != undefined) {
      this.getSessionSemestre(this.sessionSemestreId);
      this.title = 'Modifier une session semestre';
      this.isEdit = true;
    }
  }

  getSessionSemestre(sessionSemestreId: number) {
    this.referentielService.recupererUneResource('sessionsemestre', sessionSemestreId).subscribe({
      next: (data) => {
        this.sessionSemestre = data;
        this.SemestreEtAnnee = this.sessionSemestre.libelleSemestre + ' - ' + this.sessionSemestre.libelleAnneeScolaire
        this.initializeForm(this.sessionSemestre);
      }
    });
  }

  initializeForm(semestre: SessionSemestreAddEdit | null) {
    this.sessionSemestreFormGroup = this._formBuilder.group({
      id: [semestre?.id ?? ''],
      semestre: [semestre?.semestre ?? '', Validators.required],
      anneeScolaireId: [semestre?.anneeScolaireId ?? '', Validators.required],
      dateDebut: [semestre?.dateDebut ?? '', Validators.required],
      dateFin: [semestre?.dateFin ?? '', Validators.required],
      etat: [semestre?.etat ?? '', Validators.required],
    });
  }

  editerSessionSemestre() {
    const payload = this.sessionSemestreFormGroup.value;
    payload.ecole = this.ecoleId;
    this.referentielService.modifierUneRessource('sessionsemestre', Number(this.sessionSemestreId), payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Le semestre a été modifiées avec succès !!! ');
          this.goBack();
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
      }
    });
  }

  goBack() {
    this.router.navigate(['admin/referentiel/sessions'])
  }

}

