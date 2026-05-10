import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ToastrService } from '@iqx-limited/ngx-toastr';
import { EnseigantList } from '../../../../../../core/models/enseignant/enseignant-list';
import { CoursEdit } from '../../../../../../core/models/planification/cours';
import { EmploiDuTemps } from '../../../../../../core/models/planification/emploi-du-temp';
import { Enseignement } from '../../../../../../core/models/planification/enseignement';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Salle } from '../../../../../../core/models/referentiels/salle';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';

@Component({
  selector: 'app-planifier-cours',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './planifier-cours.component.html',
  styleUrls: ['./planifier-cours.component.css']
})
export class PlanifierCoursComponent implements OnInit {
  errorMessage?: string;
  coursFormGroup!: FormGroup;
  cours?: any;
  coursId: number;
  enseigantList: EnseigantList[] = [];
  enseignementtList: Enseignement[] = [];
  epmloiDuTempsList: EmploiDuTemps[] = [];
  matiereList: Matiere[] = [];
  classeList: Classe[] = [];
  salleList: Salle[] = [];

  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Planifier un cours";

  private readonly coursService = inject(PlanificationResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly referentielService = inject(ReferentielService);
  //  private readonly enseignantService = inject(EnseignantService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.coursId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getEnseignementList();
    this.getEmploiDuTempsList();
    this.getSalleList();
    this.initializeForm(null);
    if (this.coursId != null && this.coursId != undefined) {
      this.getCoursById(this.coursId);
      this.title = 'Reprogrammer le cours';
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

  getEnseignementList() {
    this.coursService.getAllEnseignement().subscribe(
      (data: any[]) => {
        this.enseignementtList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  getEmploiDuTempsList() {
    this.coursService.getAllEmploiDutemps().subscribe(
      (data: any[]) => {
        this.epmloiDuTempsList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  getSalleList() {
    this.referentielService.getAllSalles().subscribe(
      (data: any[]) => {
        this.salleList = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }
  /*
    getEnseigantList() {
      this.enseignanService.getAllEnseignants().subscribe(
        (data: any[]) => {
          this.enseigantList = data;
        },
        (error) => (this.errorMessage = <any>error)
      );
    }
  */

  initializeForm(cours: CoursEdit | null) {
    this.coursFormGroup = this._formBuilder.group({
      id: [cours?.id ? cours.id : ''],
      libelle: [cours?.libelle ? cours.libelle : '', Validators.required],
      enseignement: [cours?.enseignement ? cours.enseignement : '', Validators.required],
      emploiDuTemps: [cours?.emploiDuTemps ? cours.emploiDuTemps : '', Validators.required],
      salle: [cours?.salle ? cours.salle : '', Validators.required],
      heureDebut: [cours?.heureDebut ? cours.heureDebut : '', Validators.required],
      heureFin: [cours?.heureFin ? cours.heureFin : '', Validators.required],
      dateCours: [cours?.dateCours ? cours.dateCours : '', Validators.required],
    });
  }

  getCoursById(enseignantId: number) {
    this.coursService.getSingleResource('cours', enseignantId).subscribe({
      next: (data) => {
        this.cours = data;
        this.initializeForm(this.cours);
      }
    });
  }

  ajoutereditCours() {
    const payload: CoursEdit = {
      id: this.coursFormGroup.get("id")!.value,
      libelle: this.coursFormGroup.get("libelle")!.value,
      enseignement: this.coursFormGroup.get("enseignement")!.value,
      emploiDuTemps: this.coursFormGroup.get("emploiDuTemps")!.value,
      salle: this.coursFormGroup.get("salle")!.value,
      dateCours: this.coursFormGroup.get("dateCours")!.value,
      heureDebut: this.coursFormGroup.get("heureDebut")!.value,
      heureFin: this.coursFormGroup.get("heureFin")!.value,
    }

    if (this.coursId === null || this.coursId === undefined) {
      payload.ecole = this.ecoleId;
      this.coursService.createEditRessource('cours', payload).subscribe({
        next: (data) => {
          console.log('payload after : ', data);
          this.toastService.success('success', 'Le cours a été planifié avec succès.');
          this.router.navigate(['/admin/planification/cours']);
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      payload.ecole = this.ecoleId;
      this.coursService.createEditRessource('cours', payload).subscribe({
        next: data => {
          this.toastService.success('success', 'Le compte de l\'enseignant a été modifié avec succès.');
          this.router.navigate(['/admin/planification/cours']);

        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.warning('error', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }

  }

}