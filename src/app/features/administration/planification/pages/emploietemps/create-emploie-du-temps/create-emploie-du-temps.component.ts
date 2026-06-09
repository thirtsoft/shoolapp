import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EnseigantList } from '../../../../../../core/models/enseignant/enseignant-list';
import { EmploiDuTemps } from '../../../../../../core/models/planification/emploi-du-temp';
import { ListeEnseignement } from '../../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Salle } from '../../../../../../core/models/referentiels/salle';
import { SessionSemestre } from '../../../../../../core/models/referentiels/session-semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-create-emploie-du-temps',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-emploie-du-temps.component.html',
  styleUrls: ['./create-emploie-du-temps.component.css']
})
export class CreateEmploieDuTempsComponent implements OnInit {
  errorMessage?: string;
  emploieId: number;
  emploiFormGroup!: FormGroup;
  addEditEmploie: EmploiDuTemps = {};
  typeSalles?: string[] = ["Ordinaire", "Spécialisée", "Extérieure"];
  classList: ListeClasse[] = [];
  sessionSemestreList: SessionSemestre[] = [];
  salleList: Salle[] = [];
  matiereList: Matiere[] = [];
  enseignantList: EnseigantList[] = [];
  enseignementList: ListeEnseignement[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Création d'un emploi du temps ";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielResourceService);
  //  private readonly enseignantService = inject(EnseignantService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
  ) {
    this.emploieId = this.route.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.chargerLesDonnees();
    this.initializeForm(null);
    if (this.emploieId != null && this.emploieId != undefined) {
      this.getEmploieDuTemps(this.emploieId);
    }
  }

  private chargerLesDonnees() {
    this.utilisateurService.getUtilisateur(this.userId!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => this.utilisateur = data
    });

    this.referentielService.getResourceList('sessionsemestre').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.sessionSemestreList = data;
      }
    });

    this.referentielService.getResourceList('classe').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.classList = data
    });

    this.referentielService.getResourceList('salle').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.salleList = data
    });

    this.referentielService.getResourceList('matiere').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.matiereList = data
    });
  }

  onClasseSelected() {
    const classe = this.emploiFormGroup.get('classe')?.value;
    if (classe) {
      this.getEnseignementByClass(classe);
    }
  }

  private getEnseignementByClass(classId: number) {
    this.planificationService.getAllEnseignementByclasse(classId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.enseignementList = data;
      }
    });
  }


  getEmploieDuTemps(batId: number) {
    this.planificationService.getEmploiDuTemps(batId).subscribe({
      next: (data) => {
        this.addEditEmploie = data;
        if (this.addEditEmploie?.classe) {
          this.getEnseignementByClass(this.addEditEmploie.classe);
        }
        this.emploiFormGroup = this._formBuilder.group({
          id: [this.addEditEmploie?.id ?? ''],
          classe: [this.addEditEmploie?.classe ?? '', Validators.required],
          sessionSemestre: [this.addEditEmploie?.sessionSemestre ?? '', Validators.required],
          semaine: [this.addEditEmploie?.semaine ?? ''],
          coursEditDTOList: this._formBuilder.array([])
        });
        for (let i = 0; i < this.addEditEmploie.coursEditDTOList!.length; i++) {
          (this.emploiFormGroup.get('coursEditDTOList') as FormArray).push(
            this._formBuilder.group({
              id: [this.addEditEmploie.coursEditDTOList![i].id],
              libelle: [this.addEditEmploie.coursEditDTOList![i].libelle, Validators.required],
              enseignement: [this.addEditEmploie.coursEditDTOList![i].enseignement, Validators.required],
              salle: [this.addEditEmploie.coursEditDTOList![i].salle, Validators.required],
              dateCours: [this.addEditEmploie.coursEditDTOList![i].dateCours, Validators.required],
              heureDebut: [this.addEditEmploie.coursEditDTOList![i].heureDebut, Validators.required],
              heureFin: [this.addEditEmploie.coursEditDTOList![i].heureFin],
            })
          )
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  initializeForm(emploie: EmploiDuTemps | null) {
    this.emploiFormGroup = this._formBuilder.group({
      id: [emploie?.id ?? ''],
      classe: [emploie?.classe ?? '', Validators.required],
      sessionSemestre: [emploie?.sessionSemestre ?? '', Validators.required],
      semaine: [emploie?.semaine ?? '', Validators.required],
      coursEditDTOList: this._formBuilder.array([
        this.newCourseItem()
      ])
    });
  }

  coursEditDTOList(): FormArray {
    return this.emploiFormGroup.get('coursEditDTOList') as FormArray;
  }

  newCourseItem(): FormGroup {
    return this._formBuilder.group({
      libelle: ['', Validators.required],
      enseignement: ['', Validators.required],
      salle: ['', Validators.required],
      dateCours: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: [''],
      ecole: this.ecoleId
    })
  }

  onAddCourseItem() {
    this.coursEditDTOList().push(this.newCourseItem());
  }

  removeCourseItem(classItemIndex: number) {
    this.coursEditDTOList().removeAt(classItemIndex);
  }


  ajouterEmploieDuTemps() {
    const payload: EmploiDuTemps = {
      id: this.emploiFormGroup.get("id")!.value,
      classe: this.emploiFormGroup.get("classe")!.value,
      sessionSemestre: this.emploiFormGroup.get("sessionSemestre")!.value,
      semaine: this.emploiFormGroup.get("semaine")!.value,
      coursEditDTOList: this.emploiFormGroup.get("coursEditDTOList")!.value,
    }
    payload.ecole = this.ecoleId;
    if (!this.emploieId && this.emploieId == undefined) {
      this.planificationService.createEmploiDuTemps(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Emploi du temps a été enregistrées avec succès !!! ');
            this.router.navigate(['/admin/planification/emploi-du-temps']);
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.addEditEmploie = this.emploiFormGroup.value;
      this.addEditEmploie.ecole = this.ecoleId;
      this.planificationService.updateEmploiDuTemps(this.emploieId, this.addEditEmploie).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Emploi du temps a été modifiées avec succès !!! ');
            this.router.navigate(['/admin/planification/emploi-du-temps']);
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
  }

  goBack() {
    this.router.navigate(['/admin/planification/emploi-du-temps']);
  }


}
