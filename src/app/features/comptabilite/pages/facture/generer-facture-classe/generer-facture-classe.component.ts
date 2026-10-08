import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenereFactureClasse } from '../../../../../core/models/comptabilite/generer-facture-classe';
import { ListeClasse } from '../../../../../core/models/referentiels/classe';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

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
  echeanceDate: any;

  montant?: any;
  selectedClasse: any;
  selectedMois: any;
  selectedAnnee: any;

  title = "Générer une facture pour une classe";

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    this.getClassList();
    this.getListMois();
    this.getListAnnees();
  }

  getClassList() {
    this.referentielResource.getResourceList('classe')?.subscribe({
      next: (data: any) => {
        this.classList = data;
      }
    });
  }

  getClasseLibelle(): string {
    if (!this.classList || !this.selectedClasse) {
      return '';
    }
    const selectedId = Number(this.selectedClasse);
    const classe = this.classList.find(c => Number(c.id) === selectedId);

    return classe?.libelle || '';
  }


  getListMois() {
    this.referentielResource.getResourceBaseList('mois')?.subscribe({
      next: (data) => {
        this.moisList = data;
      }
    });
  }

  getMoisLibelle(): string {
    if (!this.moisList || !this.selectedMois) {
      return '';
    }
    const selectedId = Number(this.selectedMois);
    const mois = this.moisList?.find(c => Number(c.id) === selectedId);
    return mois?.mois || '';
  }

  getListAnnees() {
    this.referentielResource.getResourceBaseList('annees')?.subscribe({
      next: (data) => {
        this.anneesList = data;
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.selectedClasse && this.selectedMois && this.selectedAnnee);
  }

  onTypeClasseSelected() {
    if (this.selectedClasse) {
      this.selectedClasse = Number(this.selectedClasse);
    }
    this.getClasseLibelle();
  }

  onMoisSelected() {
    if (this.selectedMois) {
      this.selectedMois = Number(this.selectedMois);
    }
    this.getMoisLibelle();
  }

  onAnneeSelected() {
    console.log('selectedAnnee', this.selectedAnnee);
  }

  genererFacture() {
    if (!this.isFormValid()) {
      this.toastService.warning('Attention', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    const payload: GenereFactureClasse = {
      classeId: this.selectedClasse,
      mois: this.selectedMois,
      annee: this.selectedAnnee,
      echeanceDate: this.echeanceDate,
    };
    //  this.comptabiliteResource.genererUneResource('facture', this.selectedClasse, this.selectedMois, this.selectedAnnee).subscribe({
    this.comptabiliteResource.genererUneResourceClasse('facture', payload).subscribe({
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
