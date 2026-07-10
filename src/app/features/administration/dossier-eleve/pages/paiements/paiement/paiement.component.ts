import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { EncodateLogo } from '../../../../../../core/enumeration/encodage-logo-data';
import { Paiement } from '../../../../../../core/models/comptabilite/paiement';
import { TypePaiement } from '../../../../../../core/models/referentiels/type-paiement';
import { DossierEleveService } from '../../../service/dossier-eleve.service';


@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent implements OnInit {

  errorMessage?: string;
  paiements: Paiement[] = [];
  paiement: Paiement = {};
  typePaiement: TypePaiement[] = [];
  paiementId?: number;

  paiementFormGroup!: FormGroup;

  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getPaiements();
  }

  getPaiements() {
    this.dossierEleveService.getAllPaiements().subscribe(
      (data: any[]) => {
        this.paiements = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  ajouterPaiement() {
    this.router.navigate(['/admin/dossier-eleve/paiement/create']);
  }

  editerPaiement(paiementId: number) {
    this.router.navigate(['/admin/dossier-eleve/paiement/edit', paiementId]);
  }

  imprimerFichePaiement(pay: Paiement) {
    this.dossierEleveService.getPaiement(pay.id!).subscribe({
      next: (data) => {
        this.paiement = data;
        this.imprimerPaiement();
      }
    });
  }

  imprimerPaiement() {
    pdfMake.createPdf(this.getDocumentFichePaiement()).open();
  }

  DownloadPdf() {
    const document: any = this.getDocumentFichePaiement();
    pdfMake.createPdf(document).download('"FICHE"' + this.paiement.code + '.pdf');
  }

  getDocumentFichePaiement(): any {
    return {
      content: [
        {
          image: EncodateLogo.image,
          width: 150,
          alignment: 'center',
          bold: true,
          absolutePosition: { x: 50, y: -5 },
          opacity: 1
        },
        {
          text: 'FICHE DE PAIEMENT',
          fontSize: 16,
          alignment: 'center',
          bold: true,
          margin: [0, 60, 0, 0]
        },
        {
          //  text: 'Date : ' + moment(new Date()).format("MM-DD-YYYY"),
          fontSize: 12,
          bold: true,
          alignment: 'center',
        },
        {
          text: 'Tél: +221 33 321 45 67 / Email: ecoledauphin@gmail.com',
          fontSize: 10,
          bold: true,
          alignment: 'center',
        },
        {
          fillColor: '#0000ff',
          opacity: 1,
          layout: 'noBorders',
          margin: [0, 12, 0, 0],
          table: {
            widths: ["*"],
            headerRows: 0,
            body: [
              [[
                {
                  text: 'IDENTITE DE L\'ELEVE', alignment: 'center',
                  fontSize: 13,
                  bold: true,
                  margin: [3, 0, 0, 0],
                  color: 'white'
                },

              ]
              ],
            ]
          }
        },

        {
          columns: [

            [
              {
                text: ` Nom : ${this.paiement?.eleveDTO?.nom}`,
                fontSize: 12,
                margin: [0, 15, 0, 15]
              },
              {
                //          text: 'Né (e) le : ' + moment(this.paiement?.eleveDTO?.dateNaissance).format("MM-DD-YYYY"),
                margin: [0, 15, 0, 15],
                fontSize: 12,
              },
              {
                text: `Sexe: ${this.paiement?.eleveDTO?.sexe}`,
                margin: [0, 15, 0, 15],
                fontSize: 12,
              },
            ],

            [
              {
                text: `Prénom (s) : ${this.paiement?.eleveDTO?.nom}`,
                margin: [0, 15, 0, 15],
                fontSize: 12,
              },
              {
                text: `Lieu de naissance (s) : ${this.paiement?.eleveDTO?.lieuNaissance}`,
                margin: [0, 15, 0, 15],
                fontSize: 12,
              },
              {
                text: `Nationalité: ${this.paiement?.eleveDTO?.nationalite}`,
                margin: [0, 15, 0, 15],
                fontSize: 12,
              },
            ],


          ]
        },

        {
          fillColor: '#0000ff',
          opacity: 1,
          layout: 'noBorders',
          table: {
            widths: ["*"],
            body: [
              [[
                {
                  text: 'Type paiement',
                  alignment: 'center',
                  fontSize: 12,
                  bold: true,
                  margin: [3, 0, 0, 0],
                  color: 'white'
                },

              ]
              ],
            ]
          }
        },

        {
          layout: 'headerLineOnly',
          fontSize: 12,
          table: {
            widths: [250, 249],
            headerRows: 1,
            body: [
              [
                {
                  text: 'Libellé',
                  fillColor: '#AFB8B5',
                  fontSize: 12,
                  alignement: 'left',
                },
                {
                  text: 'Montant',
                  fillColor: '#AFB8B5',
                  fontSize: 12,
                  alignement: 'right',

                },
              ],
              ...this.paiement.typePaiements!.map(p => ([p.libelle, p.montant,])),
            ]

          }
        },

        {
          fillColor: '#0000ff',
          layout: 'noBorders',
          table: {
            widths: ["*"],
            body: [
              [[
                {
                  text: 'Détails paiement', alignment: 'center',
                  fontSize: 12,
                  bold: true,
                  margin: [3, 0, 0, 0],
                  color: 'white'
                },

              ]
              ],
            ]
          }
        },

        {
          columns: [

            [
              {
                text: ` Code paiement : ${this.paiement?.code}`,
                fontSize: 12,
                margin: [0, 15, 0, 15],
                alignment: 'left'
              },

            ],
            [
              {
                text: ` Montant total : ${this.paiement?.montant}`,
                fontSize: 12,
                margin: [0, 15, 0, 15],
                alignment: 'center'
              }
            ],
            [

              {
                text: ` Moi : ${this.paiement?.mois}`,
                fontSize: 12,
                margin: [0, 15, 0, 15],
                alignment: 'right'
              },
            ],
          ]
        },
        {
          text: 'Signature',
          style: 'sign',
          alignment: 'right',
          decoration: 'underline',
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
        sign: {
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

}