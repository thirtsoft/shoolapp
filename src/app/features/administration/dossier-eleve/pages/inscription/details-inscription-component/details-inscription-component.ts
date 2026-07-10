import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { EtatLibelle } from '../../../../../../core/constants/etat-libelle';
import { DetailsInscription } from '../../../../../../core/models/dossiereleve/details-inscription';
import { Eleve } from '../../../../../../core/models/parent/parent';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { Classe } from '../../../../../../core/models/referentiels/classe';
import { DossierResourceService } from '../../../service/dossier-resource.service';
declare const pdfMake: any;

@Component({
  selector: 'app-details-inscription-component',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, TitleCasePipe],
  templateUrl: './details-inscription-component.html',
  styleUrl: './details-inscription-component.css',
})
export class DetailsInscriptionComponent implements OnInit {

  errorMessage?: string;
  inscriptionId?: number;
  isEdit: boolean = false;
  detailsInscription: DetailsInscription = {};
  eleve?: Eleve;
  anneeScolaire?: AnneeScolaire;
  classe?: Classe;

  isEditMode = false;
  title = "Détails inscription";

  disableAddButton = false;

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  targetEtatCode: string = '';
  isMotifRequired: boolean = false;

  libelleEtat = EtatLibelle;

  private readonly modalService = inject(NgbModal);
  private readonly dossierResource = inject(DossierResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.inscriptionId = this.activeRoute.snapshot.params['id'];
    if (this.inscriptionId != null && this.inscriptionId != undefined) {
      this.getDetailsInscription(this.inscriptionId);
    }
  }

  initActionForm() {
    this.actionForm = this.fb.group({
      motifAnnulation: ['']
    });
  }

  getDetailsInscription(inscriptionId: number) {
    this.dossierResource.afficherDetailsResource('inscription', inscriptionId).subscribe({
      next: (data: any) => {
        this.detailsInscription = data;
        console.log('details', this.detailsInscription);
        this.eleve = this.detailsInscription.eleveDTO;
        this.anneeScolaire = this.detailsInscription.anneeScolaireDTO;
        this.classe = this.detailsInscription.classeDTO;
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information inscription : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la récupération des informations : ' + data.error);
      }
    }
    );
  }

  openEtatModal(content: any, action: 'confirmer' | 'valider' | 'annuler', etatCode: string): void {
    this.modalActionLabel = action;
    this.targetEtatCode = etatCode;

    this.isMotifRequired = ['annuler'].includes(action);

    if (!this.actionForm) {
      this.initActionForm();
    }

    const motifControl = this.actionForm.get('motifAnnulation');

    if (this.isMotifRequired) {
      motifControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      motifControl?.clearValidators();
    }
    motifControl?.updateValueAndValidity();

    this.actionForm.reset();

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'md'
    }).result.then(
      (result) => {
        if (result === 'confirm') {
          const payload = {
            nouvelEtatCode: this.targetEtatCode,
            motifAnnulation: this.actionForm.value.motifAnnulation || null
          };
          this.changerEtat(action, Number(this.inscriptionId), payload);
        }
      },
      () => { }
    );
  }

  changerEtat(action: string, evalId: number, payload: any) {
    this.dossierResource.changeEtatResource('inscription', evalId, payload).subscribe({
      next: (data: any) => {
        const successMessages: { [key: string]: string } = {
          confirmer: `L'inscription a été confirmée avec succès.`,
          valider: `L'inscription a été validée avec succès.`,
          annuler: `L'inscription a été annulée avec succès.`,
        };
        this.toastService.success('Succès', successMessages[action] || 'Action effectuée.');
        this.getDetailsInscription(Number(this.inscriptionId));
      },
      error: (err: any) => {
        this.toastService.error('Erreur', 'Impossible de modifier l\'état : ' + (err.error?.message || err.message));
      }
    });
  }

  getStatusClass(): string {
    const etat = this.detailsInscription.etat;
    if ([this.libelleEtat.LIBELLE_ETAT_VALIDEE].includes(etat!)) return 'status-validated';
    if ([this.libelleEtat.LIBELLE_ETAT_EN_ATTENTE, this.libelleEtat.LIBELLE_ETAT_ENCOURS].includes(etat!)) return 'status-sent';
    if ([this.libelleEtat.LIBELLE_ETAT_ANNULE].includes(etat!)) return 'status-remise';
    return '';
  }

  openConfirmationDialog(action: 'publier' | 'valider' | 'deplublier' | 'annuler' | 'terminer'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider cette réunion ?',
    };
    const payload = null;

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, Number(this.inscriptionId), payload);
        }
      })
      .catch(() => { });
  }


  imprimerUneInscription() {
    pdfMake.createPdf(this.getDocumentRecuInscription()).open();
  }

  DownloadPdfRecu() {
    const document: any = this.getDocumentRecuInscription();
    pdfMake.createPdf(document).download('"Recu_"' + this.classe?.libelle + '.pdf');
  }

  getDocumentRecuInscription(): any {
    if (!this.detailsInscription) return {};

    const codeDossier = this.detailsInscription.code || '';
    const eleve = this.detailsInscription.eleveDTO || {};
    const classe = this.detailsInscription.classeDTO?.libelle || '';
    const anneeScolaire = this.detailsInscription.anneeScolaireDTO?.libelle || '';
    const montant = this.detailsInscription.montantInscription || 0;

    let dateInscriptionFormatted = '';
    if (this.detailsInscription.dateInscription) {
      const d = new Date(this.detailsInscription.dateInscription);
      dateInscriptionFormatted = d.toLocaleDateString('fr-FR');
    }

    const formatDevise = (val: number) => {
      const brute = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(val);
      return brute.replace(/[\u00A0\u202F]/g, ' ').replace('F CFA', 'F CFA');
    };

    return {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          columns: [
            {
              text: 'LOGO ECOLE',
              fontSize: 12,
              bold: true,
              color: '#1A5276',
              width: 100,
              alignment: 'left'
            },
            {
              text: [
                { text: "ÉCOLE LES DAUPHINS\n", fontSize: 11, bold: true, color: '#1A5276' },
                { text: "Derrière le casino du cap vert, Dakar\n", fontSize: 8, color: '#555555' },
                { text: "Tél: 33 820 10 92 - BP 6268 Dakar étoile\n", fontSize: 8, color: '#555555' },
                { text: "Web: www.ecolelesdauphins.org\n", fontSize: 8, color: '#4A90E2' },
                { text: "« L'école pour grandir »", fontSize: 8, italic: true, bold: true }
              ],
              alignment: 'right',
              margin: [0, 0, 0, 0]
            }
          ]
        },

        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E0E0E0' }], margin: [0, 12, 0, 12] },

        {
          columns: [
            { text: `ANNÉE SCOLAIRE : ${anneeScolaire}`, fontSize: 9.5, bold: true, color: '#333333' },
            { text: `Date : ${dateInscriptionFormatted}`, fontSize: 9.5, bold: true, alignment: 'right', color: '#555555' }
          ]
        },
        {
          text: 'REÇU D\'INSCRIPTION',
          fontSize: 15,
          alignment: 'center',
          bold: true,
          color: '#1A5276',
          margin: [0, 15, 0, 4],
          letterSpacing: 1
        },
        {
          text: `N° ${codeDossier}`,
          fontSize: 9.5,
          alignment: 'center',
          bold: true,
          color: '#7F8C8D',
          margin: [0, 0, 0, 20]
        },

        {
          style: 'infoTable',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: [{ text: 'Code Élève : ', bold: true }, { text: eleve.matricule || '' }], fontSize: 10 },
                { text: [{ text: 'Classe Cible : ', bold: true }, { text: this.classe?.libelle }], fontSize: 10 }
              ],
              [
                { text: [{ text: 'Nom complet : ', bold: true }, { text: `${eleve.prenom || ''} ${eleve.nom || ''}`.toUpperCase() }], fontSize: 10 },
                { text: [{ text: 'Sexe : ', bold: true }, { text: eleve.sexe || '' }], fontSize: 10 }
              ],
              [
                { text: [{ text: 'Né(e) le : ', bold: true }, { text: eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '' }, { text: ' à ' }, { text: eleve.lieuNaissance || '' }], fontSize: 10 },
                { text: [{ text: 'Nationalité : ', bold: true }, { text: eleve.nationalite || '' }], fontSize: 10 }
              ]
            ]
          },
          layout: {
            paddingLeft: () => 12,
            paddingRight: () => 12,
            paddingTop: () => 10,
            paddingBottom: () => 10,
            fillColor: '#F8F9F9',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E5E7E9',
            vLineColor: () => '#E5E7E9'
          },
          margin: [0, 0, 0, 25]
        },

        {
          table: {
            widths: ['*', 120],
            headerRows: 1,
            body: [
              [
                { text: 'Désignation / Libellé de l\'opération', style: 'tableHeader', alignment: 'left' },
                { text: 'Montant versé', style: 'tableHeader', alignment: 'right' }
              ],
              [
                { text: `Frais d'inscription scolaire — Classe de ${classe}\n(Dossier de candidature validé)`, alignment: 'left', fontSize: 10.5, margin: [0, 8, 0, 8] },
                { text: formatDevise(montant), alignment: 'right', fontSize: 10.5, bold: true, margin: [0, 8, 0, 8] }
              ],
              [
                { text: 'TOTAL PAYÉ', bold: true, alignment: 'left', fontSize: 10.5, fillColor: '#EAEDED', margin: [0, 6, 0, 6] },
                { text: formatDevise(montant), bold: true, alignment: 'right', fontSize: 11, fillColor: '#EAEDED', color: '#27AE60', margin: [0, 6, 0, 6] }
              ]
            ]
          },
          layout: {
            hLineWidth: (i: any, node: any) => { return (i === 0 || i === node.table.body.length) ? 1.5 : 1; },
            vLineWidth: () => 1,
            hLineColor: (i: any, node: any) => { return (i === 0 || i === node.table.body.length) ? '#1A5276' : '#E5E7E9'; },
            vLineColor: () => '#E5E7E9',
            paddingLeft: () => 10,
            paddingRight: () => 10
          },
          margin: [0, 0, 0, 35]
        },

        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'IMPORTANT :', bold: true, fontSize: 8.5, color: '#C0392B', margin: [0, 0, 0, 4] },
                { text: 'Ce reçu tient lieu de preuve officielle d\'inscription pour l\'année scolaire en cours. Il doit être conservé soigneusement par les parents pour toute réclamation administrative ou fiscale.', fontSize: 8, color: '#7F8C8D', leadingLineHeight: 1.2 }
              ]
            },
            { width: '10%', text: '' },
            {
              width: '40%',
              stack: [
                { text: `Fait à Dakar, le ${dateInscriptionFormatted}`, fontSize: 8.5, italic: true, alignment: 'center' },
                { text: 'L\'Agent Comptable / Le Trésorier', bold: true, fontSize: 9.5, alignment: 'center', margin: [0, 6, 0, 45] },
                { text: 'Signature & Cachet de l\'École', fontSize: 8, alignment: 'center', color: '#BDC3C7', decoration: 'underline' }
              ]
            }
          ]
        }
      ],

      styles: {
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#FFFFFF',
          fillColor: '#1A5276',
          margin: [0, 4, 0, 4]
        }
      }
    };
  }

  goBack() {
    window.history.back();
  }
}