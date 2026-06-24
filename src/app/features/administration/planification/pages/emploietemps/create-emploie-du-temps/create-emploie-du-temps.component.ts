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
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';

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
  anneeScolaireList: AnneeScolaire[] = [];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};
  enseignementsParCours: { [index: number]: ListeEnseignement[] } = {};

  title = "Création d'un emploi du temps ";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielResourceService);
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
    this.utilisateurService.getUtilisateur(this.userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    this.referentielService.getResourceList('anneescolaire').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => {
        this.anneeScolaireList = data;
      }
    });

    this.referentielService.getResourceList('salle').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.salleList = data
    });

    this.referentielService.getResourceList('matiere').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: any) => this.matiereList = data
    });
  }

  /*
  onClasseSelected() {
    const classe = this.emploiFormGroup.get('classe')?.value;
    if (classe) {
      this.getEnseignementByClass(classe);
    }
  }*/

  onClasseSelected(index: number) {
    const coursGroup = this.coursEditDTOList().at(index) as FormGroup;
    const classeId = coursGroup.get('classe')?.value;

    if (classeId) {
      this.getEnseignementByClass(classeId, index);
    } else {
      this.enseignementsParCours[index] = [];
      coursGroup.get('enseignement')?.setValue('');
    }
  }

  /*
    private getEnseignementByClass(classId: number) {
      this.planificationService.getAllEnseignementByclasse(classId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => {
          this.enseignementList = data;
        }
      });
    }*/

  private getEnseignementByClass(classId: number, index: number) {
    this.planificationService
      .getAllEnseignementByclasse(classId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.enseignementsParCours[index] = data;

          const coursGroup = this.coursEditDTOList().at(index);
          coursGroup.get('enseignement')?.setValue('');
        }
      });
  }

  getEmploieDuTemps(batId: number) {
    this.planificationService.getEmploiDuTemps(batId).subscribe({
      next: (data) => {
        this.addEditEmploie = data;

        // 1. Initialisation du groupe principal du formulaire
        this.emploiFormGroup = this._formBuilder.group({
          id: [this.addEditEmploie?.id ?? ''],
          classe: [this.addEditEmploie?.classe ?? ''],
          sessionSemestre: [this.addEditEmploie?.sessionSemestre ?? ''],
          anneeScolaire: [this.addEditEmploie?.anneeScolaire ?? '', Validators.required],
          semaine: [this.addEditEmploie?.semaine ?? ''],
          coursEditDTOList: this._formBuilder.array([])
        });

        const coursArray = this.emploiFormGroup.get('coursEditDTOList') as FormArray;

        // 2. Boucle pour ajouter les éléments au FormArray
        if (this.addEditEmploie.coursEditDTOList) {
          for (let i = 0; i < this.addEditEmploie.coursEditDTOList.length; i++) {
            const coursData = this.addEditEmploie.coursEditDTOList[i];
            coursArray.push(
              this._formBuilder.group({
                id: [coursData.id],
                libelle: [coursData.libelle, Validators.required],
                classe: [coursData.classe, Validators.required],
                enseignement: [coursData.enseignement, Validators.required],
                salle: [coursData.salle, Validators.required],
                dateCours: [coursData.dateCours, Validators.required],
                heureDebut: [coursData.heureDebut, Validators.required],
                heureFin: [coursData.heureFin],
              })
            );

            if (coursData.classe) {
              this.getEnseignementByClass(coursData.classe, i);
            }
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'emploi du temps', err);
        this.toastService.error('Erreur lors du chargement des données.');
      }
    });
  }

  initializeForm(emploie: EmploiDuTemps | null) {
    this.emploiFormGroup = this._formBuilder.group({
      id: [emploie?.id ?? ''],
      /*       classe: [emploie?.classe ?? ''],
            sessionSemestre: [emploie?.sessionSemestre ?? ''],
            semaine: [emploie?.semaine ?? ''], */
      anneeScolaire: [emploie?.anneeScolaire ?? '', Validators.required],
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
      classe: ['', Validators.required],
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
    delete this.enseignementsParCours[classItemIndex];
  }



  ajouterEmploieDuTemps() {
    const payload: EmploiDuTemps = {
      id: this.emploiFormGroup.get("id")!.value,
      classe: this.emploiFormGroup.get("classe")!.value,
      sessionSemestre: this.emploiFormGroup.get("sessionSemestre")!.value,
      semaine: this.emploiFormGroup.get("semaine")!.value,
      anneeScolaire: this.emploiFormGroup.get("anneeScolaire")!.value,
      coursEditDTOList: this.emploiFormGroup.get("coursEditDTOList")!.value,
    }
    payload.ecole = this.ecoleId;
    if (!this.emploieId && this.emploieId == undefined) {
      this.planificationService.createEmploiDuTempsAnneeScolaire(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Emploi du temps a été enregistrées avec succès !!! ');
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
    } else {
      this.addEditEmploie = this.emploiFormGroup.value;
      this.addEditEmploie.ecole = this.ecoleId;
      this.planificationService.updateEmploiDuTempsAnneeScolaire(this.emploieId, this.addEditEmploie).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Emploi du temps a été modifiées avec succès !!! ');
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
  }

  goBack() {
    this.router.navigate(['/admin/planification/emploi-du-temps']);
  }


}
