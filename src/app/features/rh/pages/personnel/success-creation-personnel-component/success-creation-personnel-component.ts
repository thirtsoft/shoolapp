import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OrganizationResponse } from '../../../../../core/models/onboarding/organization/organization-response';
import { ConfigOrganizationService } from '../../../../administration/configorganization/services/configorganization.service';

interface PersonnelSuccessData {
  uuid?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  cni?: string;
  address?: string;
  matricule?: string;

  typePersonnelUuid?: string;
  typePersonnelCode?: string;
  typePersonnelLibelle?: string;

  dateDebutService?: string;
  dateFinService?: string;

  statut?: string;
  eligiblePaie?: boolean;

  userUuid?: string;
}

interface AccountSuccessData {
  created?: boolean;
  userUuid?: string;
  login?: string;
  temporaryPassword?: string;
  roleCode?: string;
}

interface PersonnelCreationResponse extends PersonnelSuccessData {
  compteUtilisateur?: AccountSuccessData;
}

@Component({
  selector: 'app-success-creation-personnel-component',
  standalone: true,
  imports: [],
  templateUrl: './success-creation-personnel-component.html',
  styleUrl: './success-creation-personnel-component.css',
})
export class SuccessCreationPersonnelComponent implements OnInit {

  personnel: PersonnelSuccessData = {};
  account: AccountSuccessData = { created: false };
  whatsappMessage = '';

  loading = signal(false);
  organizationData!: OrganizationResponse;
  error = signal('');

  private readonly router = inject(Router);
  private readonly organizationConfigService = inject(ConfigOrganizationService);
  private readonly toastService = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {

    const navigation = this.router.getCurrentNavigation();

    const state = navigation?.extras?.state ?? history.state;

    const creationResponse = state?.creationResponse as PersonnelCreationResponse | undefined;

    if (!creationResponse) {
      this.router.navigate(['/admin/rh/personnels']);
      return;
    }

    this.personnel = creationResponse;

    if (creationResponse.compteUtilisateur) {

      this.account = {
        created: !!creationResponse.compteUtilisateur.created,
        userUuid: creationResponse.compteUtilisateur.userUuid,
        login: creationResponse.compteUtilisateur.login,
        temporaryPassword: creationResponse.compteUtilisateur.temporaryPassword,
        roleCode: creationResponse.compteUtilisateur.roleCode
      };

    } else {

      this.account = { created: false };
    }

    this.loadOrganizationInfos();
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
    this.organizationConfigService.getOrganizationInfos(organizationUuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.organizationData = response;
          this.loading.set(false);
          this.prepareWhatsappMessage();
        },
        error: (error) => {
          console.error('Erreur chargement organisation:', error);
          this.toastService.error('Erreur', 'Impossible de charger les informations');
          this.loading.set(false);
        }
      });
  }


  get fullName(): string {
    return `${this.personnel.firstName ?? ''} ${this.personnel.lastName ?? ''}`.trim();
  }

  get typePersonnelLabel(): string {
    return this.personnel.typePersonnelLibelle ?? '—';
  }

  get hasAccount(): boolean {
    return this.account.created === true;
  }

  private prepareWhatsappMessage(): void {

    const nom = this.fullName || 'Agent';

    if (!this.hasAccount) {
      this.whatsappMessage = '';
      return;
    }

    const etablissement = this.organizationData?.libelle ?? 'Votre établissement';

    this.whatsappMessage =
      `Bonjour ${nom},\n\n` +

      `Votre établissement, ${etablissement}, vous informe que votre compte professionnel Scoolli a été créé.\n\n` +

      `🔐 Identifiants de connexion\n` +
      `Identifiant : ${this.account.login ?? '—'}\n` +
      `Mot de passe temporaire : ${this.account.temporaryPassword ?? '—'}\n\n` +

      `🌐 Accès à Scoolli :\n` +
      `https://scoolli.com/auth/login/v2/\n\n` +

      `Vous pouvez utiliser ces identifiants pour vous connecter à votre espace Scoolli.\n\n` +

      `⚠️ Pour votre sécurité, veuillez modifier votre mot de passe après votre première connexion.\n\n` +

      `Message envoyé par ${etablissement} via Scoolli.\n\n` +

      `Cordialement,\n` +
      `${etablissement}`;
  }

  envoyerParWhatsApp(): void {

    if (!this.hasAccount || !this.whatsappMessage) {
      return;
    }

    const phone = this.normaliserTelephone(this.personnel.mobile);

    const message = encodeURIComponent(this.whatsappMessage);

    let whatsappUrl = `https://wa.me/?text=${message}`;

    if (phone) {
      whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    }

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  }

  private normaliserTelephone(phone?: string): string {

    if (!phone) {
      return '';
    }

    let value = phone.replace(/\D/g, '');

    if (value.startsWith('221')) {
      return value;
    }

    if (value.length === 9 && value.startsWith('7')) {
      return `221${value}`;
    }

    return value;
  }

  copierIdentifiants(): void {

    if (!this.hasAccount) {
      return;
    }

    const text =
      `Identifiant : ${this.account.login ?? '—'}\n` +
      `Mot de passe temporaire : ${this.account.temporaryPassword ?? '—'}`;

    navigator.clipboard.writeText(text);
  }

  retourListe(): void {
    this.router.navigate(['/admin/rh/personnels']);
  }

  creerAutrePersonnel(): void {
    this.router.navigate(['/admin/rh/personnel/create']);
  }
}