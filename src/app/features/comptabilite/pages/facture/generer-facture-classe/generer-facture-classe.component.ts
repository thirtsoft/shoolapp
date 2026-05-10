import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { ToastrService } from '@iqx-limited/ngx-toastr';

interface Mois {
  id: number;
  libelle: string;
}

@Component({
  selector: 'app-generer-facture-classe',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './generer-facture-classe.component.html',
  styleUrls: ['./generer-facture-classe.component.css']
})
export class GenererFactureClasseComponent implements OnInit {

  errorMessage?: string;
  isEdit: boolean = false;

  classList?: ListeClasse[];
  moisList?: any[] = [];
  anneesList?: any[] = [];

  montant?: any;
  selectedTypeService: any;
  selectedMois: any;
  selectedAnnee: any;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Générer une facture pour une classe";

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClassList();
    this.getListMois();
    this.getListAnnees();
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
    this.referentielResource.getResourceList('classe')?.subscribe({
      next: (data:any) => {
        this.classList = data;
        console.log('classList', this.classList);
      }
    });
  }

  getListMois() {
    this.referentielResource.getResourceBaseList('mois')?.subscribe({
      next: (data) => {
        this.moisList = data;
        console.log('moisList', this.moisList);
      }
    });
  }

  getListAnnees() {
    this.referentielResource.getResourceBaseList('annees')?.subscribe({
      next: (data) => {
        this.anneesList = data;
        console.log('anneesList', this.anneesList);
      }
    });
  }

  onTypeClasseSelected() {
    console.log('selectedTypeService', this.selectedTypeService);
  }

  onMoisSelected() {
    console.log('selectedMois', this.selectedMois);
  }


  onAnneeSelected() {
    console.log('selectedAnnee', this.selectedAnnee);
  }

  genererFacture() {
    this.comptabiliteResource.genererUneResource('facture', this.selectedTypeService, this.selectedMois, this.selectedAnnee).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', data.message);
          this.router.navigate(['admin/comptabilite/facture'])
        } else if (data.statut === 'NOCONTENT') {
          this.router.navigate(['admin/comptabilite/facture'])
        }
        else if (data.statut === 'FAILED') {
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
    this.router.navigate(['admin/comptabilite/facture'])
  }

}
