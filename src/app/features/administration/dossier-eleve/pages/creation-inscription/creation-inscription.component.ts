import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierEleveService } from '../../service/dossier-eleve.service';
import { Inscription } from '../../../../../core/models/dossiereleve/request/inscription';
import { Classe } from '../../../../../core/models/referentiels/classe';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { Eleve } from '../../../../../core/models/parent/parent';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../utilisateur/service/utilisateur.service';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { CommonModule } from '@angular/common';
import { ReferentielService } from '../../../referentiel/service/referentiel.service';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';

@Component({
  selector: 'app-creation-inscription',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creation-inscription.component.html',
  styleUrls: ['./creation-inscription.component.css']
})
export class CreationInscriptionComponent implements OnInit {

  @Input() eleveId?: number;
  @Input() code!: number;
  @Input() eleve?: string;

  errorMessage!: string;
  today = new Date();
  title = "Réinscrire un élève";

  inscriptionFormGroup!: FormGroup;
  inscription?: Inscription = {};
  inscriptionId?: number;
  isEdit: boolean = false;

  classes: Classe[] = [];
  anneeScolaires: AnneeScolaire[] = [];
  eleves: Eleve[] = [];


  ecoleId: any;

  userId?: number;

  utilisateur: Utilisateur = {};


  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly referentielService = inject(ReferentielService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.eleve = this.localStorage.getItem('eleve');
    this.inscriptionId = this.route.snapshot.params['id'];
    this.getConnectedUserInfos();
    this.getClasses();
    this.getAnneeScolaires();
    this.getEleves();
    this.initializeInscriptionForm(null);
    if (this.inscriptionId != null && this.inscriptionId != undefined) {
      this.getInscription(this.inscriptionId);
      this.title = 'Modifier une inscription';
      this.isEdit = true;
    }
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId!).subscribe({
      next: data => {
        this.utilisateur = data;
        //    this.ecoleId = this.utilisateur.ecoleId;
      },
      error: error => { console.log(error) },
    });
  }

  getInscription(inscriptionId: number) {
    this.dossierEleveService.getInscription(inscriptionId).subscribe({
      next: (data) => {
        this.inscription = data;
        this.initializeInscriptionForm(this.inscription);
      }
    });
  }

  getEleves() {
    this.dossierEleveService.getResourceList('eleve')?.subscribe({
      next: (data: any) => {
        this.eleves = data;
        console.log('eleve list', this.eleves);
      }
    });
  }

  getClasses() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classes = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getAnneeScolaires() {
    this.referentielService.getAllAnneeScolaires().subscribe(
      (data: any[]) => {
        this.anneeScolaires = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  initializeInscriptionForm(inscription: Inscription | null) {
    this.inscriptionFormGroup = this._formBuilder.group({
      id: [inscription?.id ? inscription.id : ''],
      eleveId: [inscription?.eleveDTO?.id ? inscription?.eleveDTO?.id : '', Validators.required],
      anneeScolaireId: [inscription?.anneeScolaireDTO?.id ? inscription?.anneeScolaireDTO?.id : '', Validators.required],
      classeId: [inscription?.classeDTO?.id ? inscription?.classeDTO?.id : '', Validators.required],
      montantInscription: [inscription?.montantInscription ? inscription.montantInscription : '', Validators.required],
    });
  }

  getInscriptionByCodeEleve(code: string) {
    this.dossierEleveService.getInscriptionByCodeEleve(code).subscribe({
      next: (data) => {
        this.inscription = data;
        this.inscriptionId = this.inscription.id;
        this.initializeInscriptionForm(this.inscription);
      }
    });
  }

  ajouterEditInscription() {
    const payload = this.inscriptionFormGroup.value;
    payload.ecole = this.ecoleId;
    if (!this.isEdit) {
      this.dossierEleveService.saveInscription(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'L\'élève a été inscrit avec succès !!! ');
            this.router.navigate(['admin/dossier-eleve/inscriptions'])
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
      this.dossierEleveService.updateInscription(this.inscriptionId!, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'L\inscription a été modifiée avec succès !!! ');
            this.router.navigate(['admin/dossier-eleve/inscriptions'])
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

  }

  goBack() {
    this.router.navigate(['admin/dossier-eleve/inscriptions'])
  }


}
