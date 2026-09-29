import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EtatLibelle } from '../../../../../core/constants/etat-libelle';
import { DetailsFacture } from '../../../../../core/models/comptabilite/details-facture';
import { DetailsLigneFacture } from '../../../../../core/models/comptabilite/details-ligne-facture';
import { MoyenPaiement } from '../../../../../core/models/referentiels/moyen-paiement';
import { ParametresEtablissement } from '../../../../../core/models/referentiels/parametre-etablissement';
import { DateformatService } from '../../../../../core/services/date-format.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { ReferentielService } from '../../../../administration/referentiel/service/referentiel.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

declare const pdfMake: any;

@Component({
  selector: 'app-details-facture',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, DecimalPipe, DatePipe, TitleCasePipe],
  templateUrl: './details-facture.component.html',
  styleUrls: ['./details-facture.component.css']
})
export class DetailsFactureComponent implements OnInit {

  factureId!: number;

  detailsFacture?: DetailsFacture = {};

  title = 'Détails facture';

  detailEleve?: any;

  remisePourcent?: number;
  montantRemise: any;
  montantInitial: any;

  parametresEtablissement: ParametresEtablissement = {};

  libelleEtat = EtatLibelle;

  logoUrl = '';

  showPaiementModal = false;

  paiementForm!: FormGroup;

  moyenPayementList: MoyenPaiement[] = [];

  paiementActionLoading: number | null = null;
  paiementAction: 'confirm' | 'reject' | null = null;

  actionForm!: FormGroup;
  modalActionLabel: string = '';
  isMotifRequired: boolean = false;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielService = inject(ReferentielService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dateFormat = inject(DateformatService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly modalService = inject(NgbModal);

  constructor() {
    this.factureId = Number(this.activeRoute.snapshot.params['id']);
    this.initPaiementForm();
  }

  ngOnInit(): void {
    this.getParametresEtablissement();
    this.getMoyenPaiementList();

    if (this.factureId > 0) {
      this.getDetailsFacture(this.factureId);
      this.title = 'Détails d\'une facture';
    }
  }

  initActionForm(): void {
    this.actionForm = this.formBuilder.group({
      motif: ['']
    });
  }

  getMoyenPaiementList(): void {
    this.referentielResource.getResourceList('moyenpaiement')
      ?.subscribe({
        next: (data: any) => {
          this.moyenPayementList = data ?? [];
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement des moyens de paiement :',
            error
          );
        }
      });
  }

  getParametresEtablissement(): void {
    this.referentielService.getParametresEtablissement()
      .subscribe({
        next: (config: ParametresEtablissement) => {
          this.parametresEtablissement = config;
        },
        error: (error) => {
          console.error(
            'Erreur chargement configuration établissement',
            error
          );
        }
      });
  }

  getDetailsFacture(factureId: number): void {
    this.comptabiliteResource.afficherDetailsResource('facture', factureId)
      .subscribe({
        next: (data: any) => {
          this.detailsFacture = data;
          this.detailEleve = this.detailsFacture?.eleve;
          this.remisePourcent = this.detailsFacture?.remise;
          const lignes = this.detailsFacture?.detailsLigneFactureDTOS ?? [];

          for (const ligne of lignes) {
            this.montantRemise = ligne.montantRemise;
            this.montantInitial = ligne.montantInitial;
          }
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement du détail de la facture :',
            error
          );

          this.toastService.error(
            'Erreur',
            error?.error?.message || 'Impossible de charger les détails de la facture.'
          );
        }
      });
  }

  getAllTarifs(): any[] {
    let tarifs: any[] = [];
    const lignes = this.detailsFacture?.detailsLigneFactureDTOS ?? [];
    lignes.forEach((detail: DetailsLigneFacture) => {
      if (
        detail?.typeServiceOffertDTO &&
        detail.typeServiceOffertDTO.listTarifDTOList
      ) {
        tarifs = tarifs.concat(
          detail.typeServiceOffertDTO.listTarifDTOList
        );
      }
    });

    return tarifs;
  }

  getTotalTarifsDisponibles(): number {
    let total = 0;
    const lignes = this.detailsFacture?.detailsLigneFactureDTOS ?? [];
    lignes.forEach((detail) => {
      if (detail.typeServiceOffertDTO?.listTarifDTOList) {
        detail.typeServiceOffertDTO.listTarifDTOList.forEach(
          (tarif) => {
            total += Number(tarif.montant || 0);
          }
        );
      }
    });

    return total;
  }

  formatMontant(value: number | null | undefined): string {
    return `${value?.toString()} FCFA`;
  }

  getMontantDejaPaye(): number {
    return Number(this.detailsFacture?.montantPayement || 0);
  }

  getMontantRestantFacture(): number {
    const montantFacture = Number(this.detailsFacture?.montant || 0);
    const montantPaye = this.getMontantDejaPaye();
    return Math.max(0, montantFacture - montantPaye);
  }

  peutEnregistrerPaiement(): boolean {
    return (this.getMontantRestantFacture() > 0 &&
      (
        this.detailsFacture?.etat ===
        this.libelleEtat.LIBELLE_ETAT_ENCOURS ||
        this.detailsFacture?.etat ===
        this.libelleEtat.LIBELLE_ETAT_PAYEE_PARTIELLE
      )
    );
  }

  initPaiementForm(): void {
    this.paiementForm = this.formBuilder.group({
      facture: [null, Validators.required],
      moyenPaiement: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      reference: ['']
    });
  }

  isMontantValide(): boolean {
    const montant = Number(this.paiementForm.get('montant')?.value || 0);
    const reste = this.getMontantRestantFacture();
    return (
      montant > 0 &&
      montant <= reste
    );
  }

  getMontantRestantLabel(): string {
    const reste = this.getMontantRestantFacture();
    if (reste === 0) {
      return 'Facture entièrement payée';
    }
    return `${reste.toLocaleString('fr-FR')} FCFA`;
  }

  openPaiementModal(): void {
    if (!this.peutEnregistrerPaiement()) {
      return;
    }

    this.getMoyenPaiementList();

    this.showPaiementModal = true;

    this.paiementForm.reset();

    this.paiementForm.patchValue({
      facture: this.detailsFacture?.id,
      moyenPaiement: '',
      montant: this.getMontantRestantFacture(),
      reference: ''
    });
  }

  closePaiementModal(): void {
    this.showPaiementModal = false;
  }

  enregistrerUnPaiement(): void {
    if (this.paiementForm.invalid) {
      this.paiementForm.markAllAsTouched();
      this.toastService.warning(
        'Attention',
        'Veuillez renseigner les informations obligatoires.'
      );

      return;
    }

    const montantRecu = Number(this.paiementForm.get('montant')?.value || 0);
    const montantRestant = this.getMontantRestantFacture();

    if (montantRecu <= 0) {
      this.toastService.warning('Attention', 'Veuillez saisir un montant valide.');
      return;
    }

    if (montantRecu > montantRestant) {
      this.toastService.warning(
        'Attention',
        `Le montant ne peut pas dépasser le reste à payer de ${montantRestant.toLocaleString('fr-FR')} FCFA.`
      );
      return;
    }

    const payload = {
      facture: this.detailsFacture?.id,
      montant: montantRecu,
      moyenPaiement: this.paiementForm.get('moyenPaiement')?.value,
      reference: this.paiementForm.get('reference')?.value?.trim() || null
    };

    this.comptabiliteResource.creerUneRessource('payement', payload)
      .subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success(
              'Succès',
              'Le paiement a été enregistré avec succès.'
            );

            this.closePaiementModal();
            this.getDetailsFacture(this.factureId);
          } else {
            this.toastService.error(
              'Erreur',
              data.message || 'Erreur lors de l\'enregistrement du paiement.'
            );
          }
        },

        error: (error) => {
          console.error('Erreur paiement :', error);

          this.toastService.error(
            'Erreur',
            error?.error?.message || 'Erreur lors de l\'enregistrement du paiement.'
          );
        }
      });
  }

  getTotalMontantFacture(): string {
    const total =
      (
        this.detailsFacture
          ?.detailsLigneFactureDTOS ?? []
      ).reduce(
        (sum, ligne) =>
          sum +
          Number(
            ligne.montantRemise ??
            ligne.montantInitial ??
            0
          ),
        0
      );

    return `${total.toLocaleString('fr-FR')} FCFA`;
  }

  getStatusClass(status: string | undefined): string {
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

      case 'PAYÉE PARTIELLE':
      case 'PAYEE_PARTIELLE':
        return 'status-partial';

      default:
        return 'status-pending';
    }
  }

  private normalizePaiementStatus(status: string | undefined): string {
    if (!status) {
      return '';
    }

    return status
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  isPaiementEnAttente(status: string | undefined): boolean {
    return [
      'A CONFIRMEE',
      'A CONFIRMER',
      'A_CONFIRMEE',
      'A_CONFIRMER'
    ].includes(this.normalizePaiementStatus(status));
  }

  getPaiementStatusClass(status: string | undefined): string {
    const normalizedStatus = this.normalizePaiementStatus(status);

    switch (normalizedStatus) {
      case 'VALIDEE':
      case 'VALIDÉE':
        return 'status-success';

      case 'A CONFIRMEE':
      case 'A CONFIRMER':
      case 'A_CONFIRMEE':
      case 'A_CONFIRMER':
        return 'status-warning';

      case 'REJETEE':
      case 'REJETÉE':
        return 'status-danger';

      case 'ANNULEE':
      case 'ANNULLÉE':
        return 'status-secondary';

      default:
        return 'status-default';
    }
  }

  getMoisName(mois: number): string {
    const moisNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre'
    ];

    return moisNames[mois - 1] || '';
  }

  getTotalFinal(): number {
    let total = this.detailsFacture?.montant || 0;

    if (
      this.remisePourcent &&
      this.remisePourcent > 0
    ) {
      total = total * (1 - this.remisePourcent / 100);
    }

    return total;
  }

  openPaiementActionModal(content: any, paiement: any, action: 'confirmer' | 'rejeter'): void {
    this.modalActionLabel = action;
    this.isMotifRequired = action === 'rejeter';

    if (!this.actionForm) {
      this.initActionForm();
    }

    const motifControl = this.actionForm.get('motif');

    this.actionForm.reset();

    if (this.isMotifRequired) {
      motifControl?.setValidators([Validators.required, Validators.maxLength(95)]);
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

        if (result !== 'confirm') {
          return;
        }

        if (action === 'confirmer') {
          this.confirmerPaiement(paiement);
          return;
        }
        const motif = this.actionForm.get('motif')?.value?.trim();
        this.rejeterPaiement(paiement, motif);
      },
      () => { }
    );
  }

  confirmerPaiement(paiement: any): void {
    this.comptabiliteResource.confirmerPaiement(paiement.id).subscribe({
      next: () => {
        this.toastService.success('Succès', 'Le paiement a été confirmé avec succès.');

        this.getDetailsFacture(this.factureId);
      },
      error: (error: any) => {
        this.toastService.error(
          'Erreur',
          error.error?.message || 'Impossible de confirmer le paiement.'
        );
      }
    });
  }

  rejeterPaiement(paiement: any, motif: string): void {
    this.comptabiliteResource.rejeterPaiement(paiement.id, motif)
      .subscribe({
        next: () => {
          this.toastService.success('Succès', 'Le paiement a été rejeté avec succès.');
          this.getDetailsFacture(this.factureId);
        },
        error: (error: any) => {
          this.toastService.error(
            'Erreur',
            error.error?.message || 'Impossible de rejeter le paiement.'
          );
        }
      });
  }

  private async getScoolliLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/scoolli-logo.png');
      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result as string);
        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Impossible de charger le logo Scoolli :', error);
      return null;
    }
  }

  async imprimerFacture(): Promise<void> {
    const document = await this.getDocumentFicheFacture();
    pdfMake.createPdf(document).print();
  }

  async DownloadPdf(): Promise<void> {
    const document = await this.getDocumentFicheFacture();

    pdfMake
      .createPdf(document)
      .download(
        `${this.detailsFacture?.numeroFacture || 'facture'}.pdf`
      );
  }

  async getDocumentFicheFacture(): Promise<any> {

    const facture = this.detailsFacture;

    const lignes = facture?.detailsLigneFactureDTOS ?? [];

    const paiements = facture?.paiements ?? [];

    const etablissement = this.parametresEtablissement;

    const eleve = facture?.eleve;

    const hasSchoolLogo =
      !!etablissement?.logoBase64 &&
      etablissement.logoBase64.trim() !== '';

    const scoolliLogoBase64 = !hasSchoolLogo ? await this.getScoolliLogoBase64() : null;

    const montantTotal = Number(facture?.montant || 0);
    const montantPaye = this.getMontantDejaPaye();
    const montantRestant = this.getMontantRestantFacture();
    const remise = Number(facture?.remise || 0);

    const formatFcfa = (value: number | null | undefined): string => {
      return `${Number(value || 0)
        .toLocaleString('fr-FR')
        .replace(/\u00A0/g, ' ')} FCFA`;
    };

    const logo = hasSchoolLogo ? etablissement.logoBase64 : scoolliLogoBase64;

    const headerLeft: any[] = [];

    if (logo) {
      headerLeft.push({
        image: logo,
        width: hasSchoolLogo ? 72 : 88,
        margin: [0, 0, 0, 8]
      });
    }
    headerLeft.push({
      text: etablissement?.nom || 'ÉTABLISSEMENT SCOLAIRE',
      fontSize: 14,
      bold: true,
      color: '#172033',
      margin: [0, 0, 0, 4]
    });
    if (etablissement?.adresse) {
      headerLeft.push({
        text: etablissement.adresse,
        fontSize: 8.5,
        color: '#667085',
        margin: [0, 0, 0, 2]
      });
    }
    if (etablissement?.telephone) {
      headerLeft.push({
        text: `Tél. : ${etablissement.telephone}`,
        fontSize: 8.5,
        color: '#667085',
        margin: [0, 0, 0, 2]
      });
    }
    if (etablissement?.email) {
      headerLeft.push({
        text: etablissement.email,
        fontSize: 8.5,
        color: '#667085',
        margin: [0, 0, 0, 2]
      });
    }

    const headerRight: any[] = [
      {
        text: 'FACTURE',
        fontSize: 22,
        bold: true,
        color: '#172033',
        alignment: 'right',
        margin: [0, 0, 0, 8]
      },
      {
        text: facture?.numeroFacture ? `N° ${facture.numeroFacture}` : '',

        fontSize: 9,
        color: '#667085',
        alignment: 'right',
        margin: [0, 0, 0, 4]
      },

      {
        text:
          facture?.dateFacture
            ? `Émise le ${facture.dateFacture}`
            : '',

        fontSize: 9,
        color: '#667085',
        alignment: 'right',
        margin: [0, 0, 0, 8]
      },

      {
        text:
          facture?.etat || '',

        fontSize: 8,
        bold: true,
        color: '#344054',
        alignment: 'right'
      }
    ];

    const nomEleve = `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim();

    const periode =
      [
        facture?.mois,
        facture?.annee
      ]
        .filter(Boolean)
        .join(' ');

    const invoiceRows = lignes.map(
      (ligne: DetailsLigneFacture) => {

        const montant =
          Number(
            ligne.montantRemise ??
            ligne.montantInitial ??
            0
          );

        return [

          {
            text: ligne.typeServiceOffertDTO?.libelle || 'Service scolaire',
            fontSize: 9,
            color: '#344054',
            margin: [0, 8, 0, 8]
          },

          {
            text: ligne.typeServiceOffertDTO?.libelle || '—',
            fontSize: 8,
            color: '#667085',
            alignment: 'center',
            margin: [0, 8, 0, 8]
          },

          {
            text: this.formatMontant(montant),
            fontSize: 9,
            color: '#172033',
            alignment: 'right',
            margin: [0, 8, 0, 8]
          }
        ];
      }
    );

    const paymentRows = paiements.map(
      (paiement: any) => [

        {
          text: paiement.numeroRecu || '—',
          fontSize: 8,
          color: '#344054',
          margin: [0, 6, 0, 6]
        },

        {
          text: paiement.datePaiement ? this.dateFormat.formatDate(paiement.datePaiement) : '—',
          fontSize: 8,
          color: '#667085',
          margin: [0, 6, 0, 6]
        },

        {
          text: paiement.moyenPaiement || '—',
          fontSize: 8,
          color: '#344054',
          margin: [0, 6, 0, 6]
        },

        {
          text: paiement.reference || '—',
          fontSize: 8,
          color: '#667085',
          margin: [0, 6, 0, 6]
        },

        {
          text: this.formatMontant(paiement.montant),
          fontSize: 8,
          color: '#172033',
          bold: true,
          alignment: 'right',
          margin: [0, 6, 0, 6]
        }
      ]
    );

    return {
      pageSize: 'A4',
      pageMargins: [42, 40, 42, 55],
      content: [
        {
          columns: [
            {
              width: '*',
              stack: headerLeft
            },

            {
              width: 'auto',
              stack: headerRight
            }
          ],
          columnGap: 20,
          margin: [0, 0, 0, 20]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 510,
              y2: 0,
              lineWidth: 0.6,
              lineColor: '#E4E7EC'
            }
          ],
          margin: [0, 0, 0, 18]
        },

        {
          columns: [

            {
              width: '*',

              stack: [
                {
                  text: 'FACTURÉ À',
                  fontSize: 8,
                  bold: true,
                  color: '#98A2B3',
                  characterSpacing: 0.5,
                  margin: [0, 0, 0, 6]
                },

                {
                  text: nomEleve || '—',
                  fontSize: 12,
                  bold: true,
                  color: '#172033',
                  margin: [0, 0, 0, 5]
                },

                ...(eleve?.matricule
                  ? [
                    {
                      text: `Matricule : ${eleve.matricule}`,
                      fontSize: 8.5,
                      color: '#667085',
                      margin: [0, 0, 0, 3]
                    }
                  ]
                  : []),

                ...(eleve?.dateNaissance
                  ? [
                    {
                      text: `Né(e) le : ${this.dateFormat.formatDate(eleve.dateNaissance)}`,

                      fontSize: 8.5,
                      color: '#667085',
                      margin: [0, 0, 0, 3]
                    }
                  ]
                  : [])
              ]
            },

            {
              width: 190,

              stack: [

                {
                  text: 'PÉRIODE DE FACTURATION',
                  fontSize: 8,
                  bold: true,
                  color: '#98A2B3',
                  characterSpacing: 0.5,
                  alignment: 'right',
                  margin: [0, 0, 0, 6]
                },

                {
                  text: periode || '—',
                  fontSize: 11,
                  bold: true,
                  color: '#172033',
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },

                {
                  text: facture?.numeroFacture || '',
                  fontSize: 8.5,
                  color: '#667085',
                  alignment: 'right'
                }
              ]
            }
          ],

          margin: [0, 0, 0, 22]
        },

        {
          text: 'DÉTAIL DE LA FACTURATION',
          fontSize: 8,
          bold: true,
          color: '#98A2B3',
          characterSpacing: 0.5,
          margin: [0, 0, 0, 8]
        },

        {
          table: {
            widths: ['*', 100, 105],
            headerRows: 1,

            body: [
              [

                {
                  text: 'SERVICE',
                  fontSize: 8,
                  bold: true,
                  color: '#667085',
                  fillColor: '#F8F9FB',
                  margin: [0, 7, 0, 7]
                },

                {
                  text: 'LIBELLE',
                  fontSize: 8,
                  bold: true,
                  color: '#667085',
                  fillColor: '#F8F9FB',
                  alignment: 'center',
                  margin: [0, 7, 0, 7]
                },

                {
                  text: 'MONTANT',
                  fontSize: 8,
                  bold: true,
                  color: '#667085',
                  fillColor: '#F8F9FB',
                  alignment: 'right',
                  margin: [0, 7, 0, 7]
                }
              ],

              ...invoiceRows
            ]
          },

          layout: {

            hLineWidth: (
              i: number,
              node: any
            ) => {

              if (
                i === 0 ||
                i === node.table.body.length
              ) {
                return 0.6;
              }

              return 0.4;
            },

            vLineWidth: () => 0,

            hLineColor: () => '#EAECF0',

            paddingLeft: () => 0,

            paddingRight: () => 0,

            paddingTop: () => 0,

            paddingBottom: () => 0
          },

          margin: [
            0,
            0,
            0,
            18
          ]
        },

        {
          columns: [

            {
              width: '*',
              text: ''
            },

            {
              width: 230,

              stack: [

                {
                  columns: [

                    {
                      text: 'Sous-total',
                      fontSize: 8.5,
                      color: '#667085'
                    },

                    {
                      text:
                        this.formatMontant(
                          this.getTotalMontantFacture()
                            ? Number(
                              String(
                                this.getTotalMontantFacture()
                              ).replace(
                                /[^0-9.-]/g,
                                ''
                              )
                            )
                            : 0
                        ),

                      fontSize: 8.5,
                      color: '#344054',
                      alignment: 'right'
                    }
                  ],

                  margin: [0, 0, 0, 7]
                },

                ...(remise > 0
                  ? [
                    {
                      columns: [

                        {
                          text: `Remise (${remise}%)`,

                          fontSize: 8.5,
                          color: '#667085'
                        },

                        {
                          text: `- ${this.formatMontant(
                            Number(
                              facture?.remise ||
                              0
                            )
                          )}`,

                          fontSize: 8.5,
                          color: '#667085',
                          alignment: 'right'
                        }
                      ],

                      margin: [0, 0, 0, 7]
                    }
                  ]
                  : []),

                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: 230,
                      y2: 0,
                      lineWidth: 0.6,
                      lineColor: '#D0D5DD'
                    }
                  ],

                  margin: [
                    0,
                    2,
                    0,
                    8
                  ]
                },

                {
                  columns: [

                    {
                      text: 'TOTAL À PAYER',
                      fontSize: 9,
                      bold: true,
                      color: '#172033'
                    },

                    {
                      text: this.formatMontant(montantTotal),
                      fontSize: 12,
                      bold: true,
                      color: '#172033',
                      alignment: 'right'
                    }
                  ],
                  margin: [0, 0, 0, 8]
                },

                {
                  columns: [
                    {
                      text: 'Déjà payé',
                      fontSize: 8.5,
                      color: '#667085'
                    },

                    {
                      text: this.formatMontant(montantPaye),
                      fontSize: 8.5,
                      color: '#344054',
                      alignment: 'right'
                    }
                  ],

                  margin: [
                    0,
                    0,
                    0,
                    6
                  ]
                },

                {
                  columns: [

                    {
                      text: 'RESTE À PAYER',
                      fontSize: 9,
                      bold: true,
                      color: montantRestant > 0
                        ? '#B42318'
                        : '#027A48'
                    },

                    {
                      text: this.formatMontant(montantRestant),
                      fontSize: 10,
                      bold: true,
                      color: montantRestant > 0
                        ? '#B42318'
                        : '#027A48',

                      alignment: 'right'
                    }
                  ]
                }
              ]
            }
          ],

          margin: [
            0,
            0,
            0,
            24
          ]
        },

        ...(paiements.length > 0
          ? [

            {
              text: 'HISTORIQUE DES PAIEMENTS',
              fontSize: 8,
              bold: true,
              color: '#98A2B3',
              characterSpacing: 0.5,
              margin: [0, 0, 0, 8]
            },

            {
              table: {

                widths: [
                  70,
                  75,
                  '*',
                  '*',
                  90
                ],

                headerRows: 1,

                body: [

                  [

                    {
                      text: 'N° REÇU',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'DATE',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'MOYEN',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'RÉFÉRENCE',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB'
                    },

                    {
                      text: 'MONTANT',
                      fontSize: 7.5,
                      bold: true,
                      color: '#667085',
                      fillColor: '#F8F9FB',
                      alignment: 'right'
                    }
                  ],

                  ...paymentRows
                ]
              },

              layout: {

                hLineWidth: () => 0.4,

                vLineWidth: () => 0,

                hLineColor: () =>
                  '#EAECF0',

                paddingLeft: () => 0,

                paddingRight: () => 0,

                paddingTop: () => 6,

                paddingBottom: () => 6
              },

              margin: [
                0,
                0,
                0,
                30
              ]
            }
          ]
          : []),

        {
          columns: [

            {
              width: '*',
              text: ''
            },

            {
              width: 170,

              stack: [

                {
                  text: 'Signature / Cachet',
                  fontSize: 8,
                  color: '#667085',
                  alignment: 'center',
                  margin: [0, 0, 0, 35]
                },

                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 20,
                      y1: 0,
                      x2: 150,
                      y2: 0,
                      lineWidth: 0.6,
                      lineColor: '#98A2B3'
                    }
                  ]
                }
              ]
            }
          ],

          margin: [
            0,
            0,
            0,
            10
          ]
        }
      ],

      footer: (
        currentPage: number,
        pageCount: number
      ) => {

        return {

          margin: [
            42,
            10,
            42,
            0
          ],

          stack: [

            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 510,
                  y2: 0,
                  lineWidth: 0.4,
                  lineColor: '#EAECF0'
                }
              ],

              margin: [
                0,
                0,
                0,
                7
              ]
            },

            {
              columns: [

                {
                  text: 'Document généré avec Scoolli · scoolli.com',
                  fontSize: 7,
                  color: '#98A2B3',
                  alignment: 'left'
                },

                {
                  text: `Page ${currentPage} / ${pageCount}`,
                  fontSize: 7,
                  color: '#98A2B3',
                  alignment: 'right'
                }
              ]
            },

            {
              text: 'Une solution Wokite Technologies & Innovation',
              fontSize: 6.5,
              color: '#B0B5BF',
              alignment: 'center',
              margin: [
                0,
                3,
                0,
                0
              ]
            }
          ]
        };
      }
    };
  }

  getDocumentFicheFactureVV1(): any {
    const hasLogo =
      this.parametresEtablissement?.logoBase64 &&
      this.parametresEtablissement.logoBase64 !== '' &&
      this.parametresEtablissement.logoBase64 !== null;

    return {
      content: [
        {
          columns: [
            [
              ...(hasLogo
                ? [
                  {
                    image:
                      this.parametresEtablissement
                        .logoBase64,
                    width: 80,
                    alignment: 'left',
                    margin: [
                      0,
                      3,
                      0,
                      0
                    ]
                  }
                ]
                : []),

              ...(!hasLogo
                ? [
                  {
                    text:
                      this.parametresEtablissement
                        ?.nom ||
                      'ÉTABLISSEMENT',
                    fontSize: 14,
                    bold: true,
                    alignment: 'left',
                    margin: [
                      0,
                      10,
                      0,
                      0
                    ]
                  }
                ]
                : [])
            ],

            [
              {
                text: 'FACTURE',
                fontSize: 18,
                alignment: 'right',
                bold: true,
                margin: [
                  0,
                  8,
                  0,
                  0
                ]
              },
              {
                text: `N° : ${this.detailsFacture?.numeroFacture || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [
                  0,
                  5,
                  0,
                  2
                ]
              },
              {
                text: `Date : ${this.detailsFacture?.dateFacture || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text: `Statut : ${this.detailsFacture?.etat || ''}`,
                fontSize: 9,
                margin: [
                  0,
                  5,
                  0,
                  5
                ],
                alignment: 'right'
              }
            ]
          ]
        },

        {
          margin: [
            0,
            20,
            0,
            0
          ],

          columns: [
            [
              {
                text: 'Émetteur :',
                fontSize: 11,
                alignment: 'left',
                bold: true,
                margin: [
                  0,
                  0,
                  0,
                  8
                ]
              },
              {
                text:
                  this.parametresEtablissement
                    ?.nom || '',
                fontSize: 10,
                alignment: 'left',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text:
                  this.parametresEtablissement
                    ?.adresse || '',
                fontSize: 10,
                alignment: 'left',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text:
                  this.parametresEtablissement
                    ?.telephone || '',
                fontSize: 10,
                alignment: 'left',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text:
                  this.parametresEtablissement
                    ?.email || '',
                fontSize: 10,
                alignment: 'left',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text:
                  this.parametresEtablissement
                    ?.slogan || '',
                fontSize: 10,
                bold: true,
                alignment: 'left',
                margin: [
                  0,
                  5,
                  0,
                  0
                ]
              }
            ],

            [
              {
                text: 'Facture de :',
                fontSize: 11,
                alignment: 'right',
                bold: true,
                margin: [
                  0,
                  0,
                  0,
                  8
                ]
              },
              {
                text: `${this.detailsFacture?.eleve?.prenom || ''} ${this.detailsFacture?.eleve?.nom || ''}`,
                fontSize: 11,
                alignment: 'right',
                bold: true,
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text: `Né(e) le : ${this.dateFormat.formatDate(this.detailsFacture?.eleve?.dateNaissance)}`,
                fontSize: 9,
                alignment: 'right',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text: `Lieu : ${this.detailsFacture?.eleve?.lieuNaissance || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text: `Sexe : ${this.detailsFacture?.eleve?.sexe || ''}`,
                fontSize: 9,
                alignment: 'right',
                margin: [
                  0,
                  2,
                  0,
                  2
                ]
              },
              {
                text: `Période : ${this.detailsFacture?.mois || ''} ${this.detailsFacture?.annee || ''}`,
                fontSize: 10,
                alignment: 'right',
                bold: true,
                margin: [
                  0,
                  10,
                  0,
                  0
                ]
              }
            ]
          ]
        },

        {
          margin: [
            0,
            20,
            0,
            10
          ],

          table: {
            widths: [
              '*',
              'auto',
              'auto'
            ],

            headerRows: 1,

            body: [
              [
                {
                  text: 'Désignation',
                  fontSize: 10,
                  bold: true,
                  fillColor: '#f0f0f0',
                  margin: [
                    5,
                    5,
                    5,
                    5
                  ]
                },
                {
                  text: 'Type service',
                  fontSize: 10,
                  bold: true,
                  alignment: 'center',
                  fillColor: '#f0f0f0',
                  margin: [
                    5,
                    5,
                    5,
                    5
                  ]
                },
                {
                  text: 'Montant',
                  fontSize: 10,
                  bold: true,
                  alignment: 'right',
                  fillColor: '#f0f0f0',
                  margin: [
                    5,
                    5,
                    5,
                    5
                  ]
                }
              ],

              ...(this.detailsFacture
                ?.detailsLigneFactureDTOS ||
                []
              ).map((ligne) => {
                const montantAffiche =
                  ligne.montantRemise ??
                  ligne.montantInitial ??
                  0;

                return [
                  {
                    text: `Facture ${this.detailsFacture?.numeroFacture || ''}`,
                    alignment: 'left',
                    fontSize: 9,
                    margin: [
                      5,
                      5,
                      5,
                      5
                    ]
                  },
                  {
                    text:
                      ligne
                        .typeServiceOffertDTO
                        ?.libelle || '',
                    alignment: 'center',
                    fontSize: 9,
                    margin: [
                      5,
                      5,
                      5,
                      5
                    ]
                  },
                  {
                    text: this.formatMontant(montantAffiche),
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
                  margin: [
                    5,
                    5,
                    5,
                    5
                  ]
                },
                {
                  text: 'TOTAL',
                  alignment: 'center',
                  bold: true,
                  fontSize: 10,
                  margin: [
                    5,
                    5,
                    5,
                    5
                  ]
                },
                {
                  text: this.getTotalMontantFacture(),
                  alignment: 'right',
                  bold: true,
                  fontSize: 11,
                  color: '#2c5282',
                  margin: [
                    5,
                    5,
                    5,
                    5
                  ]
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
                    margin: [
                      0,
                      10,
                      0,
                      5
                    ]
                  },

                  {
                    text: `Somme avancée : ${this.getMontantDejaPaye().toLocaleString('fr-FR')} FCFA`,
                    fontSize: 9,
                    alignment: 'right',
                    margin: [
                      0,
                      5,
                      0,
                      2
                    ]
                  },

                  ...(this.detailsFacture?.remise
                    ? [
                      {
                        text: `Remise : ${this.detailsFacture.remise}%`,
                        fontSize: 9,
                        alignment: 'right',
                        margin: [
                          0,
                          5,
                          0,
                          2
                        ]
                      }
                    ]
                    : []),

                  {
                    text: `TOTAL À PAYER : ${this.formatMontant(this.detailsFacture?.montant)}`,
                    fontSize: 13,
                    bold: true,
                    alignment: 'right',
                    color: '#2c5282',
                    margin: [
                      0,
                      10,
                      0,
                      5
                    ]
                  },

                  {
                    text: `RESTE À PAYER : ${this.formatMontant(this.getMontantRestantFacture())}`,
                    fontSize: 11,
                    bold: true,
                    alignment: 'right',
                    margin: [
                      0,
                      5,
                      0,
                      5
                    ]
                  }
                ]
              }
            ]
          ]
        },

        {
          text: 'Historique des paiements',
          fontSize: 11,
          bold: true,
          margin: [
            0,
            20,
            0,
            8
          ]
        },

        {
          table: {
            widths: [
              'auto',
              'auto',
              '*',
              '*',
              'auto'
            ],

            headerRows: 1,

            body: [
              [
                {
                  text: 'N° reçu',
                  bold: true,
                  fontSize: 8
                },
                {
                  text: 'Date',
                  bold: true,
                  fontSize: 8
                },
                {
                  text: 'Moyen',
                  bold: true,
                  fontSize: 8
                },
                {
                  text: 'Référence',
                  bold: true,
                  fontSize: 8
                },
                {
                  text: 'Montant',
                  bold: true,
                  alignment: 'right',
                  fontSize: 8
                }
              ],

              ...(
                this.detailsFacture?.paiements ||
                []
              ).map((paiement: any) => [
                {
                  text:
                    paiement.numeroRecu ||
                    '-',
                  fontSize: 8
                },
                {
                  text:
                    paiement.datePaiement
                      ? this.dateFormat.formatDate(
                        paiement.datePaiement
                      )
                      : '-',
                  fontSize: 8
                },
                {
                  text:
                    paiement.moyenPaiement ||
                    '-',
                  fontSize: 8
                },
                {
                  text:
                    paiement.reference ||
                    '-',
                  fontSize: 8
                },
                {
                  text:
                    this.formatMontant(
                      paiement.montant
                    ),
                  alignment: 'right',
                  fontSize: 8
                }
              ])
            ]
          }
        },

        {
          text: 'Signature',
          alignment: 'right',
          decoration: 'underline',
          margin: [
            0,
            30,
            0,
            20
          ],
          italics: true
        }
      ],

      styles: {
        header: {
          fontSize: 14,
          bold: true,
          margin: [
            0,
            20,
            0,
            10
          ],
          decoration: 'underline'
        }
      }
    };
  }

  goBack(): void {
    this.router.navigate(['admin/comptabilite/facture']);
  }
}