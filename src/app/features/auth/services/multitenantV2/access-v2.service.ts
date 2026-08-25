import { inject, Injectable } from '@angular/core';
import { SessionV2Service } from './session-v2.service';
import { Router } from '@angular/router';
import { SetupStatus } from '../../../../core/models/setup/response/setup-status.model';

@Injectable({
  providedIn: 'root'
})
export class AccessV2Service {

  private readonly session = inject(SessionV2Service);
  private readonly router = inject(Router);

  determineInitialRouteV1(setupStatus: SetupStatus | null): string {

    const organization = this.session.getCurrentOrganization();
    if (!organization) {
      return '/login';
    }

    const roles = organization.roles ?? [];

    // ADMIN_SCHOOL est le seul habilité au setup
    if (roles.includes('ADMIN_SCHOOL')) {

      if (setupStatus === SetupStatus.IN_PROGRESS) {
        return '/setup';
      }

      if (setupStatus === SetupStatus.COMPLETED) {
        return '/school';
      }
      if (setupStatus === SetupStatus.FAILED || setupStatus === SetupStatus.CANCELLED) {
        return '/setup';
      }
    }

    // autres espaces

    if (roles.includes('ADMIN_GROUP_SCHOOL')) {
      return '/group-school';
    }

    if (roles.includes('ADMIN_MINISTER')) {
      return '/minister';
    }

    if (roles.includes('ADMIN_ACADEMY')) {
      return '/academy';
    }

    if (roles.includes('PLATFORM_ADMIN')) {
      return '/platform';
    }

    return '/unauthorized';

  }

  determineInitialRoute(setupStatus?: SetupStatus): string {

    const organization = this.session.getCurrentOrganization();

    if (!organization) {
      return '/login';
    }

    const roles = organization.roles ?? [];

    // ADMIN_SCHOOL est le seul habilité à faire le setup
    if (roles.includes('ADMIN_SCHOOL')) {

      if (setupStatus === SetupStatus.COMPLETED) {
        return '/admin';
      }

      // Aucun setup, IN_PROGRESS, FAILED ou CANCELLED
      // → l'ADMIN_SCHOOL doit rester dans le Setup
      return '/setup';
    }

    if (roles.includes('ADMIN_GROUP_SCHOOL')) {
      return '/group-school';
    }

    if (roles.includes('ADMIN_MINISTER')) {
      return '/minister';
    }

    if (roles.includes('ADMIN_ACADEMY')) {
      return '/academy';
    }

    if (roles.includes('PLATFORM_ADMIN')) {
      return '/platform';
    }

    return '/unauthorized';
  }

}