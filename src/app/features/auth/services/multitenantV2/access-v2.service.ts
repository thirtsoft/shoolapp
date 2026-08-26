import { inject, Injectable } from '@angular/core';
import { SetupStatus } from '../../../../core/models/setup/response/setup-status.model';
import { SessionV2Service } from './session-v2.service';

@Injectable({
  providedIn: 'root'
})
export class AccessV2Service {

  private readonly session = inject(SessionV2Service);

  determineInitialRoute(setupStatus?: SetupStatus): string {

    const organization = this.session.getCurrentOrganization();

    if (!organization) {
      return '/login';
    }

    switch (organization.space) {

      case 'PLATFORM':
        return '/saas-management';

      case 'MINISTRY':
        return '/minister';

      case 'ACADEMY':
        return '/academy';

      case 'GROUP_SCHOOL':
        return '/group-school';

      case 'SCHOOL':

        if (this.hasRole('ADMIN_SCHOOL')) {

          if (setupStatus === SetupStatus.COMPLETED) {
            return '/admin';
          }

          return '/setup';
        }
        return '/admin';


      default:
        return '/unauthorized';
    }
  }


  private hasRole(role: string): boolean {

    const organization = this.session.getCurrentOrganization();

    return organization?.roles?.includes(role) ?? false;
  }
}