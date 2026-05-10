import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { EnseigantList } from '../../../../../../core/models/enseignant/enseignant-list';
import { EmploiDuTemps } from '../../../../../../core/models/planification/emploi-du-temp';
import { ListeEnseignement } from '../../../../../../core/models/planification/liste-enseignement';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Salle } from '../../../../../../core/models/referentiels/salle';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-create-emploie-du-temps',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
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
  semestreList: Semestre[] = [];
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
  private readonly referentielService = inject(ReferentielService);
  //  private readonly enseignantService = inject(EnseignantService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.emploieId = this.route.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClassList();
    this.getSalleList();
    this.getMatiereList();
    this.getSemestreList();
    this.getEnseignements();
    this.initializeForm(null);
    if (this.emploieId != null && this.emploieId != undefined) {
      this.getEmploieDuTemps(this.emploieId);
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });
  }

  getClassList() {
    this.referentielService.getAllClasses().subscribe({
      next: (data) => {
        this.classList = data;
      }
    });
  }

  getSalleList() {
    this.referentielService.getAllSalles().subscribe({
      next: (data) => {
        this.salleList = data;
      }
    });
  }

  getEnseignements() {
    this.planificationService.getAllEnseignement().subscribe({
      next: (data) => {
        this.enseignementList = data;
      }
    });
  }

  getMatiereList() {
    this.referentielService.getAllMatieres().subscribe({
      next: (data) => {
        this.matiereList = data;
      }
    });
  }

  getSemestreList() {
    this.referentielService.getAllSemestres().subscribe({
      next: (data) => {
        this.semestreList = data;
      }
    });
  }

  getEmploieDuTemps(batId: number) {
    this.planificationService.getEmploiDuTemps(batId).subscribe({
      next: (data) => {
        this.addEditEmploie = data;
        this.emploiFormGroup = this._formBuilder.group({
          id: [this.addEditEmploie?.id ? this.addEditEmploie.id : ''],
          classe: [this.addEditEmploie?.classe ? this.addEditEmploie.classe : '', Validators.required],
          semestre: [this.addEditEmploie?.classe ? this.addEditEmploie.semestre : '', Validators.required],
          semaine: [this.addEditEmploie?.semaine ? this.addEditEmploie.semaine : ''],
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
      id: [emploie?.id ? emploie.id : ''],
      classe: [emploie?.classe ? emploie.classe : '', Validators.required],
      semestre: [emploie?.semestre ? emploie.semestre : '', Validators.required],
      semaine: [emploie?.semaine ? emploie.semaine : '', Validators.required],
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
    if (!this.emploieId && this.emploieId == undefined) {
      const payload: EmploiDuTemps = {
        id: this.emploiFormGroup.get("id")!.value,
        classe: this.emploiFormGroup.get("classe")!.value,
        semestre: this.emploiFormGroup.get("semestre")!.value,
        semaine: this.emploiFormGroup.get("semaine")!.value,
        coursEditDTOList: this.emploiFormGroup.get("coursEditDTOList")!.value,
      }
      payload.ecole = this.ecoleId;
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
