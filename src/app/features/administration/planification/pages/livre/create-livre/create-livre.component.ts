import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Matiere } from '../../../../../../core/models/referentiels/matiere';
import { Utilisateur } from '../../../../../../core/models/utilisateur/utilisateur';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { UtilisateurService } from '../../../../utilisateur/service/utilisateur.service';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { Livre } from '../../../../../../core/models/planification/livre';

@Component({
  selector: 'app-create-livre',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-livre.component.html',
  styleUrls: ['./create-livre.component.css']
})
export class CreateLivreComponent implements OnInit {

  errorMessage?: string;
  livreId: number;
  livreFormGroup!: FormGroup;
  livre: any;
  isEdit: boolean = false;
  classeList: ListeClasse[] = [];
  matiereList: Matiere[] = [];
  typeLivres: string[] = [
    "Arithmetique",
    "Dessin",
    'Ecriture',
    "Lecture",
    "Loisir",
    'Orale',
    'Autres'
  ];
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};


  title = "Ajouter un livre";

  private readonly planification = inject(PlanificationResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);


  constructor(
  ) {
    this.livreId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClasseList();
    this.getMatiereList();
    this.initializeForm(null);
    if (this.livreId != null && this.livreId != undefined) {
      this.getLivre(this.livreId);
      this.title = 'Modifier un livre';
      this.isEdit = true;
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

  getClasseList() {
    this.referentielService.getAllClasses().subscribe({
      next: (data) => {
        this.classeList = data;
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

  getLivre(livreId: number) {
    this.planification.getSingleResource('livre', livreId).subscribe({
      next: (data) => {
        this.livre = data;
        this.initializeForm(this.livre);
      }
    });
  }

  initializeForm(livre: Livre | null) {
    this.livreFormGroup = this._formBuilder.group({
      id: [livre?.id ? livre.id : ''],
      titre: [livre?.titre ? livre.titre : '', Validators.required],
      isbn: [livre?.isbn ? livre.isbn : '', Validators.required],
      type: [livre?.type ? livre.type : '', Validators.required],
      description: [livre?.description ? livre.description : ''],
      matiere: [livre?.matiere ? livre.matiere : '', Validators.required],
      classe: [livre?.classe ? livre.classe : '', Validators.required],
    });
  }

  ajouteditLivre() {
    const payload = this.livreFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.planification.createRessource('livre', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le livre a été enregistrées avec succès !!! ');
            this.router.navigate(['admin/planification/livre'])
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
      payload.ecole = this.ecoleId;
      this.planification.updateResource('livre', this.livreId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Le livre a été modifiées avec succès !!! ');
            this.router.navigate(['admin/planification/livre'])
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
    this.router.navigate(['admin/referentiels/classe'])
  }



}
