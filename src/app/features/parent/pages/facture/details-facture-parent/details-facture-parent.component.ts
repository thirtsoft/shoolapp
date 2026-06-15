import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DetailsFacture } from '../../../../../core/models/comptabilite/details-facture';
import { DetailsLigneFacture } from '../../../../../core/models/comptabilite/details-ligne-facture';
import { ParametresEtablissement } from '../../../../../core/models/referentiels/parametre-etablissement';
import { DateformatService } from '../../../../../core/services/date-format.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { ComptabiliteResourceService } from '../../../../comptabilite/services/comptabilite-resource.service';

declare const pdfMake: any;

@Component({
  selector: 'app-details-facture-parent',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './details-facture-parent.component.html',
  styleUrls: ['./details-facture-parent.component.css']
})
export class DetailsFactureParentComponent implements OnInit {

  factureId: number;
  detailsFacture?: DetailsFacture = {};
  isEdit: boolean = false;
  title = "Détails facture";
  detailEleve?: any;
  remisePourcent?: number;
  montantRemise: any;
  montantInitial: any;
  parametresEtablissement: ParametresEtablissement = {};

  logoUrl: string = '';

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dateFormat = inject(DateformatService);
  private readonly referentielResource = inject(ReferentielResourceService);

  constructor(
  ) {
    this.factureId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getParametresEtablissement();
    if (this.factureId != null && this.factureId != undefined) {
      this.getDetailsFacture(this.factureId);
      this.title = 'Détails d\'une facture';
      this.getTotalTarifsDisponibles();
    }
  }

  getParametresEtablissement(): void {
    this.referentielService.getParametresEtablissement().subscribe(
      (config: ParametresEtablissement) => {
        this.parametresEtablissement = config;
      },
      error => {
        console.error('Erreur chargement config', error);
      }
    );
  }

  getDetailsFacture(factureId: number) {
    this.comptabiliteResource.afficherDetailsResource('facture', factureId).subscribe({
      next: (data: any) => {
        this.detailsFacture = data;
        this.detailEleve = this.detailsFacture?.eleve;
        this.remisePourcent = this.detailsFacture?.remise;
        for (let i = 0; i < this.detailsFacture!.detailsLigneFactureDTOS!.length; i++) {
          this.montantRemise = this.detailsFacture?.detailsLigneFactureDTOS![i].montantRemise;
          this.montantInitial = this.detailsFacture?.detailsLigneFactureDTOS![i]?.montantInitial;
        }
      }
    });
  }

  getAllTarifs(): any[] {
    let tarifs: any[] = [];
    if (this.detailsFacture?.detailsLigneFactureDTOS != null && this.detailsFacture?.detailsLigneFactureDTOS != undefined) {
      this.detailsFacture?.detailsLigneFactureDTOS.forEach((detail: DetailsLigneFacture) => {
        if (detail?.typeServiceOffertDTO && detail.typeServiceOffertDTO.listTarifDTOList) {
          tarifs = tarifs.concat(detail.typeServiceOffertDTO.listTarifDTOList);
        }
      });
    }
    return tarifs;
  }

  getTotalTarifsDisponibles(): number {
    let total = 0;
    if (this.detailsFacture?.detailsLigneFactureDTOS != null && this.detailsFacture?.detailsLigneFactureDTOS != undefined) {
      this.detailsFacture?.detailsLigneFactureDTOS.forEach((detail) => {
        if (detail.typeServiceOffertDTO?.listTarifDTOList) {
          detail.typeServiceOffertDTO.listTarifDTOList.forEach((tarif) => {
            total += tarif.montant || 0;
          });
        }
      });
    }
    return total;
  }

  imprimerFacture() {
    pdfMake.createPdf(this.getDocumentFicheFacture()).print();

  }

  DownloadPdf() {
    const document: any = this.getDocumentFicheFacture();
    pdfMake.createPdf(document).download('"_"' + this.detailsFacture?.numeroFacture + '.pdf');
  }

  getDocumentFicheFacture(): any {
    const hasLogo = this.parametresEtablissement?.logoBase64 &&
      this.parametresEtablissement.logoBase64 !== '' &&
      this.parametresEtablissement.logoBase64 !== null;

    return {
      content: [
        {
          columns: [
            [
              ...(hasLogo ? [{
                image: this.parametresEtablissement.logoBase64,
                width: 80,
                alignment: 'left',
                margin: [0, 3, 0, 0]
              }] : []),
              ...(!hasLogo ? [{
                text: this.parametresEtablissement?.nom || 'ÉTABLISSEMENT',
                fontSize: 14,
                bold: true,
                alignment: 'left',
                margin: [0, 10, 0, 0]
              }] : [])
            ],

            [
              {
                text: 'FACTURE',
                fontSize: 18,
                alignment: 'right',
                bold: true,
                margin: [0, 8, 0, 0]
              },
              {
                text: `N° : ${this.detailsFacture?.numeroFacture || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 5, 0, 2]
              },
              {
                text: `Date : ${(this.detailsFacture?.dateFacture)}`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 2, 0, 2]
              },
              {
                text: `Statut : ${this.detailsFacture?.etat || ''}`,
                fontSize: 9,
                margin: [0, 5, 0, 5],
                alignment: 'right',
                color: this.getStatusColor(this.detailsFacture?.etat!)
              }
            ]
          ]
        },

        {
          margin: [0, 20, 0, 0],
          columns: [
            [
              {
                text: 'Émetteur :',
                fontSize: 11,
                alignment: 'left',
                bold: true,
                margin: [0, 0, 0, 8]
              },
              {
                text: this.parametresEtablissement?.nom || '',
                fontSize: 10,
                alignment: 'left',
                margin: [0, 2, 0, 2]
              },
              {
                text: this.parametresEtablissement?.adresse || '',
                fontSize: 10,
                alignment: 'left',
                margin: [0, 2, 0, 2]
              },
              {
                text: this.parametresEtablissement?.telephone || '',
                fontSize: 10,
                alignment: 'left',
                margin: [0, 2, 0, 2]
              },
              {
                text: this.parametresEtablissement?.email || '',
                fontSize: 10,
                alignment: 'left',
                margin: [0, 2, 0, 2]
              },
              {
                text: this.parametresEtablissement?.slogan || '',
                fontSize: 10,
                bold: true,
                alignment: 'left',
                margin: [0, 5, 0, 0]
              }
            ],
            [
              {
                text: 'Facture de :',
                fontSize: 11,
                alignment: 'right',
                bold: true,
                margin: [0, 0, 0, 8]
              },
              {
                text: `${this.detailsFacture?.eleve?.prenom || ''} ${this.detailsFacture?.eleve?.nom || ''}`,
                fontSize: 11,
                alignment: 'right',
                bold: true,
                margin: [0, 2, 0, 2]
              },
              {
                text: `Né(e) le : ${this.dateFormat.formatDate(this.detailsFacture?.eleve?.dateNaissance)}`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 2, 0, 2]
              },
              {
                text: `Lieu : ${this.detailsFacture?.eleve?.lieuNaissance || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 2, 0, 2]
              },
              {
                text: `Sexe : ${this.detailsFacture?.eleve?.sexe || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 2, 0, 2]
              },
              {
                text: `Période : ${(this.detailsFacture?.mois)} ${this.detailsFacture?.annee || ''}`,
                fontSize: 10,
                alignment: 'right',
                bold: true,
                margin: [0, 10, 0, 0]
              }
            ]
          ]
        },

        {
          margin: [0, 20, 0, 10],
          table: {
            widths: ['*', 'auto', 'auto'],
            headerRows: 1,
            body: [
              [
                {
                  text: 'Désignation',
                  fontSize: 10,
                  bold: true,
                  fillColor: '#f0f0f0',
                  margin: [5, 5, 5, 5]
                },
                {
                  text: 'Type service',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#f0f0f0',
                  margin: [5, 5, 5, 5]
                },
                {
                  text: 'Montant',
                  fontSize: 10,
                  bold: true,
                  alignment: 'right',
                  fillColor: '#f0f0f0',
                  margin: [5, 5, 5, 5]
                }
              ],
              ...(this.detailsFacture?.detailsLigneFactureDTOS || []).map(b => {
                const montantAffiche = b.montantRemise ?? b.montantInitial;
                return [
                  {
                    text: `Facture ${this.detailsFacture?.numeroFacture || ''}`,
                    alignment: 'left',
                    fontSize: 9,
                    margin: [5, 5, 5, 5]
                  },
                  {
                    text: b.typeServiceOffertDTO?.libelle || '',
                    alignment: 'center',
                    fontSize: 9,
                    margin: [5, 5, 5, 5]
                  },
                  {
                    text: this.formatMontant(montantAffiche!),
                    alignment: 'right',
                    fontSize: 9,
                    margin: [5, 5, 5, 5]
                  }
                ];
              }),
              [
                {
                  text: '',
                  alignment: 'left',
                  margin: [5, 5, 5, 5]
                },
                {
                  text: 'TOTAL',
                  alignment: 'center',
                  bold: true,
                  fontSize: 10,
                  margin: [5, 5, 5, 5]
                },
                {
                  text: this.getTotalMontantFacture(),
                  alignment: 'right',
                  bold: true,
                  fontSize: 11,
                  color: '#2c5282',
                  margin: [5, 5, 5, 5]
                }
              ]
            ]
          }
        },

        {
          columns: [
            [
              {
                text: '',
                width: '*'
              },

              {
                stack: [
                  {
                    text: `Sous total : ${this.getTotalMontantFacture()}`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 10, 0, 5]
                  },
                  {
                    text: `Somme avancée : ${this.detailsFacture?.montantPayement || 0} FCFA`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 5, 0, 2]
                  },
                  ...(this.detailsFacture?.remise ? [{
                    text: `Remise : ${this.detailsFacture?.remise}%`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 5, 0, 2]
                  }] : []),
                  {
                    text: `TOTAL À PAYER : ${this.formatMontant(this.detailsFacture?.montant!)}`,
                    fontSize: 13,
                    bold: true,
                    alignment: 'right',
                    color: '#2c5282',
                    margin: [0, 10, 0, 5]
                  }
                ]
              }
            ]
          ]
        },

        {
          text: `Mode de paiement : ${this.detailsFacture?.modePaiement || 'Virement bancaire'}`,
          fontSize: 9,
          alignment: 'left',
          margin: [0, 15, 0, 5],
          italics: true
        },

        {
          text: 'Signature',
          alignment: 'right',
          decoration: 'underline',
          margin: [0, 30, 0, 20],
          italics: true
        }
      ],

      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        }
      }
    };
  }

  private getStatusColor(status: string): string {
    switch (status) {
      case 'PAYÉ': return '#38a169';
      case 'ENCOURS': return '#ecc94b';
      case 'IMPAYÉ': return '#e53e3e';
      default: return '#718096';
    }
  }

  formatMontant(value: number): string {
    return `${value?.toString()} FCFA`;
  }

  getTotalMontantFacture(): string {
    const total = this.detailsFacture?.detailsLigneFactureDTOS
      ?.reduce((sum, ligne) => sum + (ligne.montantRemise! ?? ligne.montantInitial), 0);

    return `${total?.toString()} FCFA`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAYÉ':
      case 'PAYE':
        return 'status-paid';
      case 'EN_ATTENTE':
      case 'ATTENTE':
        return 'status-pending';
      case 'IMPAYÉ':
      case 'IMPAYE':
        return 'status-overdue';
      default:
        return 'status-pending';
    }
  }

  getMoisName(mois: number): string {
    const moisNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return moisNames[mois - 1] || '';
  }

  getTotalFinal(): number {
    let total = this.detailsFacture?.montant || 0;
    if (this.remisePourcent && this.remisePourcent > 0) {
      total = total * (1 - this.remisePourcent / 100);
    }
    return total;
  }

  goBack() {
    this.router.navigate(['parent/factures"'])
  }



}
