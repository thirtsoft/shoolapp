import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { DetailsFacture } from '../../../../../core/models/comptabilite/details-facture';
import { DetailsLigneFacture } from '../../../../../core/models/comptabilite/details-ligne-facture';
import { ParametresEtablissement } from '../../../../../core/models/referentiels/parametre-etablissement';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';


@Component({
  selector: 'app-details-facture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './details-facture.component.html',
  styleUrls: ['./details-facture.component.css']
})
export class DetailsFactureComponent implements OnInit {

  factureId: number;
  detailsFacture?: DetailsFacture = {};
  isEdit: boolean = false;
  title = "Détails facture";
  detailEleve?: any;
  remisePourcent?: number;
  montantRemise: any;
  montantInitial: any;
  parametresEtablissement: ParametresEtablissement = {};

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
    pdfMake.createPdf(this.getDocumentFicheFacture()).open();
  }

  DownloadPdf() {
    const document: any = this.getDocumentFicheFacture();
    pdfMake.createPdf(document).download('"Facture_"' + this.detailsFacture?.numeroFacture + '.pdf');
  }



  getDocumentFicheFacture(): any {
    return {
      content: [
        {
          columns: [

            [

              {
                image: this.parametresEtablissement.logoBase64 || '',
                width: 120,
                alignment: 'left',
                margin: [0, 3, 0, 0],
              },

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
                text: ` N° : ${this.detailsFacture?.numeroFacture}`,
                fontSize: 8,
                alignment: 'right'
              },
              {
                text: ` Date : ${this.detailsFacture?.dateFacture}`,
                fontSize: 8,
                alignment: 'right'
              },
              {
                text: ` Status : ${this.detailsFacture?.etat}`,
                fontSize: 10,
                margin: [0, 5, 0, 5],
                alignment: 'right'
              },

            ],
          ]
        },

        {
          margin: [0, 20, 0, 0],
          columns: [

            [
              {
                text: 'Emetteur:',
                fontSize: 12,
                alignment: 'left',
                bold: true,
                margin: [0, 25, 0, 0]
              },

              {
                text: this.parametresEtablissement.nom || '',
                fontSize: 10,
                alignment: 'left',
              },
              {
                text: this.parametresEtablissement.adresse || '',
                fontSize: 10,
                alignment: 'left',
              },
              {
                text: this.parametresEtablissement.telephone || '',
                fontSize: 10,
                alignment: 'left',
              },
              {
                text: this.parametresEtablissement.siteWeb || + '/' + this.parametresEtablissement.email! || '',
                fontSize: 10,
                alignment: 'left',
              },
              {
                text: this.parametresEtablissement.slogan || '',
                fontSize: 10,
                bold: true,
                alignment: 'left',
              },

            ],

            [
              {
                text: 'Facture de : ',
                fontSize: 12,
                alignment: 'right',
                bold: true,
                margin: [0, 25, 0, 0]
              },

              {
                text: ` ${this.detailsFacture?.eleve?.prenom} - ${this.detailsFacture?.eleve?.nom}`,
                fontSize: 12,
                alignment: 'right'
              },
              {
                //       text: '' + moment(this.detailsFacture?.eleve?.dateNaissance).format("MM-DD-YYYY"),
                text: '' + this.detailsFacture?.eleve?.dateNaissance,
                fontSize: 10,
                alignment: 'right'
              },
              {
                text: ` ${this.detailsFacture?.eleve?.lieuNaissance}`,
                fontSize: 10,
                alignment: 'right'
              },
              {
                text: ` ${this.detailsFacture?.eleve?.sexe}`,
                fontSize: 10,
                alignment: 'right'
              },
              {
                text: `Année:  ${this.detailsFacture?.annee}`,
                fontSize: 10,
                alignment: 'right'
              },
              {
                text: ` Mois : ${this.detailsFacture?.mois}`,
                fontSize: 10,
                alignment: 'right'
              },

            ],


          ]
        },


        {
          fontSize: 11,
          margin: [0, 10, 0, 10],
          table: {
            widths: ['*', '*', '*'],
            headerRows: 1,
            body: [
              [
                {
                  text: 'N° facture',
                  fontSize: 11,
                  alignement: 'left',
                },
                {
                  text: 'Type service',
                  fontSize: 11,
                  alignement: 'right',

                },
                {
                  text: 'Montant',
                  fontSize: 11,
                  alignement: 'right',

                },

              ],
              ...this.detailsFacture!.detailsLigneFactureDTOS!.map(b => {
                const montantAffiche = b.montantRemise ?? b.montantInitial; // montant avec remise ou initial
                return [
                  { text: this.detailsFacture?.numeroFacture, alignment: 'left', fontSize: 10 },
                  { text: b.typeServiceOffertDTO!.libelle, alignment: 'right', fontSize: 10 },
                  { text: this.formatMontant(montantAffiche!), alignment: 'right', fontSize: 10 },
                ];
              }),

              [
                {
                  text: 'TOTAL',
                  alignment: 'left',
                  fontSize: 11,

                },

                {
                  text: '',
                  fontSize: 11,
                  alignement: 'right',

                },

                {
                  text: this.getTotalMontantFacture(),
                  fontSize: 11, alignment: 'right'
                },

              ],

            ]


          },

        },


        {
          text: ` Sous total : ${this.getTotalMontantFacture()}`,
          fontSize: 10,
          alignment: 'right',
          margin: [0, 10, 0, 10],
        },

        {
          text: ` Remise mensualité : ${this.detailsFacture?.remise}%`,
          fontSize: 10,
          alignment: 'right',
          margin: [0, 5, 0, 5],
        },

        {
          text: ` TOTAL : ${this.formatMontant(this.detailsFacture?.montant!)}`,
          fontSize: 12,
          bold: true,
          alignment: 'right',
          margin: [0, 6, 0, 15],
        },


        {
          text: 'Signature',
          style: 'sign',
          alignment: 'right',
          decoration: 'underline',
          margin: [0, 25, 0, 25],
        },


      ],

      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 20, 0, 10],
          decoration: 'underline'
        },
        name: {
          fontSize: 14,
          bold: true
        },
        total: {
          fontSize: 12,
          bold: true,
          italics: true
        },
        ligne: {
          fontSize: 12,
          bold: true,
          italics: true
        },
        sgn: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true
        },
        tableHeader: {
          bold: true,
          fontSize: 14,
          alignment: 'center'
        },

      }
    };

  }

  formatMontant(value: number): string {
    return `${value?.toString()} FCFA`;
  }

  getTotalMontantFacture(): string {
    const total = this.detailsFacture?.detailsLigneFactureDTOS
      ?.reduce((sum, ligne) => sum + (ligne.montantRemise! ?? ligne.montantInitial), 0);

    return `${total?.toString()} FCFA`;
  }


  goBack() {
    this.router.navigate(['admin/comptabilite/facture'])
  }


}
