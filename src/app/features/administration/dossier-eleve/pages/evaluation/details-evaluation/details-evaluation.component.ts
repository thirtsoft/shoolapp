import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialogModalComponent } from '../../../../../../core/components/confirmation-dialog-modal/confirmation-dialog-modal.component';
import { DetailsEvaluation } from '../../../../../../core/models/dossiereleve/evaluation/details-evaluation';
import { OrganizationMiniResponse } from '../../../../../../core/models/onboarding/organization/organization-mini-response';
import { ConfigOrganizationService } from '../../../../configorganization/services/configorganization.service';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';

declare const pdfMake: any;

@Component({
  selector: 'app-details-evaluation',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './details-evaluation.component.html',
  styleUrls: ['./details-evaluation.component.css']
})
export class DetailsEvaluationComponent implements OnInit {

  errorMessage?: string;
  evaluationId?: number;
  isEdit: boolean = false;
  detailsEvaluation: DetailsEvaluation = {};
  isEditMode = false;
  title = "Détails évaluation";

  disableAddButton = false;

  logoPreview: string | null = null;

  loading = signal(false);
  organizationData: OrganizationMiniResponse = {};
  error = signal('');


  private readonly pdfColors = {
    navy: '#12386B',
    blue: '#2F6FB5',
    text: '#1F2A44',
    muted: '#6B7A90',
    softBg: '#EAF2FB',
    border: '#D6E4F2',
    waveLight: '#DCEBFA',
    white: '#FFFFFF',
    danger: '#B42318',
    success: '#027A48'
  };

  private readonly modalService = inject(NgbModal);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadOrganizationInfos();
    this.evaluationId = this.activeRoute.snapshot.params['id'];
    if (this.evaluationId != null && this.evaluationId != undefined) {
      this.getDetailsEvaluation(this.evaluationId);
    }
  }


  private loadOrganizationInfos(): void {
    const organizationUuid = localStorage.getItem('v2_organization_uuid');
    if (!organizationUuid) {
      this.error.set('Organisation non trouvée');
      this.loading.set(false);
      this.toastService.warning('Attention', 'Organisation non trouvée');
      return;
    }

    this.loading.set(true);
    this.organizationConfigService.getOrganizationConfigInfos(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.organizationData = response;
          this.loadLogo(this.organizationData);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erreur chargement organisation:', error);
          this.toastService.error('Erreur', 'Impossible de charger les informations');
          this.loading.set(false);
        }
      });
  }

  private loadLogo(organization: OrganizationMiniResponse): void {

    this.logoPreview = null;

    if (!organization.logo?.available || !organization.logo.logoUuid) {
      return;
    }
    this.organizationConfigService.getLogoContent(organization.logo.logoUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob: Blob) => {
          this.logoPreview = URL.createObjectURL(blob);
        },
        error: (error) => {
          console.error('Erreur lors du chargement du logo :', error);
          this.logoPreview = null;
        }
      });
  }


  getDetailsEvaluation(devoirId: number) {
    this.planification.getDetailsResource('evaluation', devoirId).subscribe({
      next: (data: any) => {
        this.detailsEvaluation = data;
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  openConfirmationDialog(action: 'valider'): void {
    const modalRef = this.modalService.open(ConfirmationDialogModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    const titles: { [key: string]: string } = {
      valider: 'Confirmer la validation',
    };

    const messages: { [key: string]: string } = {
      valider: 'Êtes-vous sûr de vouloir valider cette évaluation ?',
    };

    modalRef.componentInstance.title = titles[action];
    modalRef.componentInstance.message = messages[action];
    modalRef.componentInstance.btnOkText = 'Oui';
    modalRef.componentInstance.btnCancelText = 'Non';

    modalRef.result
      .then((result) => {
        if (result) {
          this.changerEtat(action, this.evaluationId!);
        }
      })
      .catch(() => { });
  }

  changerEtat(action: 'valider', evalId: number) {
    this.planification.changerEtatResource('evaluation', evalId).subscribe({
      next: (data: any) => {

        const successMessages: { [key: string]: string } = {
          valider: `Evaluation ${this.detailsEvaluation?.titre} validée avec succès.`,
        };
        this.toastService.success('succès', successMessages[action]);
        this.getDetailsEvaluation(this.evaluationId!);
      },
      error: (data: any) => {
        console.log('error', 'Erreur lors de la récupération des information du devoir : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    }
    );
  }

  getStatusClass(): string {
    const etat = this.detailsEvaluation.etat;
    if (etat === 'Validée') return 'status-validated';
    if (etat === 'Envoyée') return 'status-sent';
    if (etat === 'Remise') return 'status-remise';
    return '';
  }

  private async getOrganizationLogoBase64(): Promise<string | null> {
    const logoUuid = this.organizationData?.logo?.logoUuid;
    if (!this.organizationData?.logo?.available || !logoUuid) {
      return null;
    }

    try {
      const blob = await firstValueFrom(this.organizationConfigService.getLogoContent(logoUuid));

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    } catch (error) {
      console.error(
        'Impossible de récupérer le logo de l’organisation pour le PDF :',
        error
      );
      return null;
    }
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


  async imprimerUneEvaluation(): Promise<void> {
    if (!this.detailsEvaluation) {
      this.toastService.error('Erreur', 'Aucune évaluation à imprimer.');
      return;
    }

    const document = await this.getDocumentEvaluation();
    pdfMake.createPdf(document).print();
  }

  async telechargerEvaluationPdf(): Promise<void> {
    if (!this.detailsEvaluation) {
      this.toastService.error('Erreur', 'Aucune évaluation à télécharger.');
      return;
    }
    const document = await this.getDocumentEvaluation();
    const numero = this.detailsEvaluation.numeroEvaluation || 'evaluation';

    pdfMake.createPdf(document).download(`${numero}.pdf`);
  }


  async getDocumentEvaluation(): Promise<any> {
    const c = this.pdfColors;
    const evaluation = this.detailsEvaluation;

    if (!evaluation) {
      throw new Error('Aucune évaluation à imprimer.');
    }

    const notes = evaluation.detailsNoteEleveDTOList ?? [];
    const etablissement = this.organizationData;

    const organizationLogoBase64 = await this.getOrganizationLogoBase64();
    const logo = organizationLogoBase64 ?? await this.getScoolliLogoBase64();

    const pageSize = { width: 595.28, height: 841.89 };

    const formatDate = (value: any): string => {
      if (!value) return '—';

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    const formatHeure = (value: string | null | undefined): string => {
      if (!value) return '—';
      return value.substring(0, 5);
    };

    const valeur = (value: any): string =>
      value !== null && value !== undefined && value !== ''
        ? String(value)
        : '—';

    const lignesNotes = notes.map((detail: any, index: number) => [
      {
        text: String(index + 1),
        alignment: 'center'
      },
      {
        text: valeur(detail.matricule),
        alignment: 'center'
      },
      {
        text: valeur(detail.nomCompletEleve)
      },
      {
        text: detail.note !== null && detail.note !== undefined
          ? String(detail.note)
          : '—',
        alignment: 'center',
        bold: true
      },
      {
        text: valeur(detail.appreciation)
      }
    ]);

    const nomEtablissement = etablissement?.libelle ?? 'Établissement scolaire';

    const informationsEtablissement = [
      etablissement?.adresse,
      etablissement?.telephone,
      etablissement?.email
    ].filter((element: any) => !!element);

    const bodyNotes = [
      [
        { text: 'N°', style: 'tableHeader', alignment: 'center' },
        { text: 'MATRICULE', style: 'tableHeader', alignment: 'center' },
        { text: 'NOM ET PRÉNOM', style: 'tableHeader' },
        { text: 'NOTE', style: 'tableHeader', alignment: 'center' },
        { text: 'APPRÉCIATION', style: 'tableHeader' }
      ],
      ...lignesNotes
    ];

    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [35, 35, 35, 55],

      background: () => ({
        canvas: this.buildWave(pageSize.width, pageSize.height)
      }),

      header: () => ({
        margin: [35, 18, 35, 0],
        columns: [
          {
            width: '*',
            stack: [
              {
                text: nomEtablissement,
                bold: true,
                fontSize: 13,
                color: c.navy
              },
              {
                text: informationsEtablissement.join(' | ') || ' ',
                fontSize: 8,
                color: c.muted,
                margin: [0, 3, 0, 0]
              }
            ]
          },
          ...(logo
            ? [{
              image: logo,
              width: 48,
              height: 42,
              fit: [48, 42],
              alignment: 'right' as const
            }]
            : [])
        ]
      }),

      content: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 525,
              y2: 0,
              lineWidth: 2,
              lineColor: c.blue
            }
          ],
          margin: [0, 8, 0, 16]
        },

        {
          text: 'FICHE D’ÉVALUATION',
          fontSize: 19,
          bold: true,
          color: c.navy,
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },

        {
          text: valeur(evaluation.numeroEvaluation),
          fontSize: 10,
          color: c.muted,
          alignment: 'center',
          margin: [0, 0, 0, 18]
        },

        // Informations générales de l'évaluation
        {
          table: {
            widths: ['30%', '70%'],
            body: [
              [
                { text: 'Titre', style: 'label' },
                { text: valeur(evaluation.titre), style: 'value' }
              ],
              [
                { text: 'Description', style: 'label' },
                { text: valeur(evaluation.description), style: 'value' }
              ],
              [
                { text: 'Matière', style: 'label' },
                { text: valeur(evaluation.matiere), style: 'value' }
              ],
              [
                { text: 'Classe', style: 'label' },
                { text: valeur(evaluation.libelleClasse), style: 'value' }
              ],
              [
                { text: 'Année scolaire', style: 'label' },
                { text: valeur(evaluation.anneeScolaire), style: 'value' }
              ],
              [
                { text: 'Enseignant(e)', style: 'label' },
                { text: valeur(evaluation.nomCompletEnseignant), style: 'value' }
              ],
              [
                { text: 'Type', style: 'label' },
                { text: valeur(evaluation.evaluationType), style: 'value' }
              ],
              [
                { text: 'Mode', style: 'label' },
                { text: valeur(evaluation.evaluationMode), style: 'value' }
              ],
              [
                { text: 'État', style: 'label' },
                { text: valeur(evaluation.etat), style: 'value' }
              ],
              [
                { text: 'Date de l’évaluation', style: 'label' },
                { text: formatDate(evaluation.dateEvaluation), style: 'value' }
              ],
              [
                { text: 'Horaire', style: 'label' },
                {
                  text: `${formatHeure(evaluation.heureDebut)} - ${formatHeure(evaluation.heureFin)}`,
                  style: 'value'
                }
              ],
              [
                { text: 'Date de remise', style: 'label' },
                { text: formatDate(evaluation.dateRemise), style: 'value' }
              ],
              [
                { text: 'Session / semestre', style: 'label' },
                {
                  text: evaluation.sessionSemestre,
                  style: 'value'
                }
              ]
            ]
          },
          layout: {
            hLineColor: () => c.border,
            vLineColor: () => c.border,
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6
          },
          margin: [0, 0, 0, 20]
        },

        {
          text: 'RÉSULTATS DES ÉLÈVES',
          fontSize: 12,
          bold: true,
          color: c.navy,
          margin: [0, 0, 0, 9]
        },

        {
          text: `Nombre de notes retournées : ${notes.length}`,
          fontSize: 9,
          color: c.muted,
          margin: [0, 0, 0, 8]
        },

        {
          table: {
            headerRows: 1,
            widths: [25, 82, '*', 45, 95],
            body: bodyNotes
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? c.navy
                : rowIndex % 2 === 0
                  ? c.softBg
                  : null,
            hLineColor: () => c.border,
            vLineColor: () => c.border,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 7,
            paddingBottom: () => 7
          }
        },

        {
          text: 'Signature de l’enseignant(e)',
          bold: true,
          fontSize: 10,
          color: c.navy,
          alignment: 'right',
          margin: [0, 45, 10, 0]
        },

        {
          text: valeur(evaluation.nomCompletEnseignant),
          fontSize: 9,
          alignment: 'right',
          margin: [0, 8, 10, 0]
        }
      ],

      footer: (currentPage: number, pageCount: number) => ({
        margin: [35, 10, 35, 15],
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 525,
                y2: 0,
                lineWidth: 0.7,
                lineColor: c.border
              }
            ]
          },
          {
            columns: [
              {
                text: 'Document généré avec Scoolli · scoolli.com',
                fontSize: 8,
                color: c.muted,
                margin: [0, 6, 0, 0]
              },
              {
                text: `Page ${currentPage} / ${pageCount}`,
                alignment: 'right',
                fontSize: 8,
                color: c.muted,
                margin: [0, 6, 0, 0]
              }
            ]
          },
          {
            text: 'Une solution Wokite Technologies & Innovation',
            alignment: 'center',
            fontSize: 7,
            color: c.muted,
            margin: [0, 4, 0, 0]
          }
        ]
      }),

      styles: {
        label: {
          bold: true,
          fontSize: 9,
          color: c.muted,
          fillColor: c.softBg
        },
        value: {
          fontSize: 9,
          color: c.text
        },
        tableHeader: {
          bold: true,
          fontSize: 8,
          color: c.white,
          fillColor: c.navy
        }
      },

      defaultStyle: {
        font: 'Roboto',
        fontSize: 9,
        color: c.text
      }
    };
  }



  private buildWave(pageWidth: number, pageHeight: number): any[] {
    const c = this.pdfColors;

    return [
      {
        type: 'rect',
        x: 0,
        y: pageHeight - 24,
        w: pageWidth,
        h: 24,
        color: c.waveLight,
        lineColor: c.waveLight,
        lineWidth: 0
      },
      {
        type: 'rect',
        x: 0,
        y: pageHeight - 5,
        w: pageWidth,
        h: 5,
        color: c.blue,
        lineColor: c.blue,
        lineWidth: 0
      }
    ];
  }

  goBack() {
    window.history.back();
  }


}
