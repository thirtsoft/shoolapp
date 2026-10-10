import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { OnboardingStateService } from '../../service/onboarding-state.service';


interface AccountSuccessData {
  created?: boolean;
  userUuid?: string;
  login?: string;
  temporaryPassword?: string;
  roleCode?: string;
}

@Component({
  selector: 'app-success-step-component',
  standalone: true,
  imports: [],
  templateUrl: './success-step-component.html',
  styleUrl: './success-step-component.css',
})
export class SuccessStepComponent implements OnInit {

  private readonly state = inject(OnboardingStateService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastrService);

  whatsappMessage = '';
  readonly response = this.state.response;

  ngOnInit(): void {
    this.prepareWhatsappMessage();
  }


  private prepareWhatsappMessage(): void {
    const data = this.successData;

    if (!data) {
      this.whatsappMessage = '';
      return;
    }

    const etablissement =
      `${data.organizationName ?? ''} ${data.organizationName ?? ''}`.trim() ||
      'Votre établissement';

    const nomAdmin =
      `${data.adminFirstName ?? ''} ${data.adminLastName ?? ''}`.trim() ||
      'Administrateur';

    this.whatsappMessage =
      `Bonjour ${nomAdmin},\n\n` +
      `Votre espace client ${data.tenantName} a été créé avec succès sur Scoolli.\n\n` +
      `🔐 IDENTIFIANTS DE CONNEXION\n\n` +
      `Établissement : ${etablissement}\n` +
      `Identifiant : ${data.loginIdentifier}\n` +
      `Mot de passe temporaire : ${data.temporalPassword}\n\n` +
      `🌐 Connexion à Scoolli :\n` +
      `https://scoolli.com/auth/login/v2/\n\n` +
      `Pour votre sécurité, veuillez modifier votre mot de passe ` +
      `après votre première connexion.\n\n` +
      `Cordialement,\n${etablissement}`;
  }

  envoyerWhatsAppTenant(): void {
    const data = this.successData;
    const numero = this.normaliserTelephone(data?.tenantMobileContact);

    this.ouvrirWhatsApp(
      numero,
      'responsable du compte'
    );
  }

  envoyerWhatsAppOrganisation(): void {
    const data = this.successData;
    const numero = this.normaliserTelephone(data?.organizationMobile);

    this.ouvrirWhatsApp(
      numero,
      "établissement"
    );
  }

  private ouvrirWhatsApp(numero: string, destinataire: string): void {
    if (!numero) {
      this.toastService.warning(
        'Attention',
        `Le numéro de téléphone du ${destinataire} est indisponible.`
      );
      return;
    }

    const data = this.successData;

    if (!data?.loginIdentifier || !data?.temporalPassword) {
      this.toastService.warning(
        'Attention',
        'Les identifiants de connexion sont indisponibles.'
      );
      return;
    }

    this.prepareWhatsappMessage();

    if (!this.whatsappMessage) {
      return;
    }

    const url =
      `https://wa.me/${numero}?text=${encodeURIComponent(this.whatsappMessage)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
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



  get successData() {
    return this.response()?.successData;
  }

  async copyCredentials(): Promise<void> {
    const data = this.successData;

    if (!data) {
      return;
    }

    const credentials =
      `${data.tenantName}\n\n` +
      `Identifiant : ${data.loginIdentifier}\n` +
      `Mot de passe temporaire : ${data.temporalPassword}`;

    try {
      await navigator.clipboard.writeText(credentials);
      this.toastService.success(
        'Succès',
        'Les identifiants ont été copiés.'
      );

    } catch (error) {
      console.error('Impossible de copier les identifiants', error);
    }
  }

  async copyValue(value: string): Promise<void> {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);

    } catch (error) {
      console.error('Impossible de copier la valeur', error);

    }
  }

  terminer() {
    void this.router.navigate(['/saas-management/onboarding/tenant']);
  }

}