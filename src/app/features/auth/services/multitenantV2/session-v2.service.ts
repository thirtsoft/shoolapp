import { inject, Injectable } from '@angular/core';
import { SignInV2Response } from '../../../../core/models/auth/multitenantV2/sign-in-v2-response.model';
import { UserV2Response } from '../../../../core/models/auth/multitenantV2/user-v2-response.model';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { AccessibleOrganizationResponse } from '../../../../core/models/auth/multitenantV2/accessible-organization-response.model';

@Injectable({
  providedIn: 'root'
})
export class SessionV2Service {

  private readonly localStorage = inject(LocalStorageService);

  saveSession(response: SignInV2Response): void {

    this.localStorage.setItem('v2_access_token', response.accessToken);

    this.localStorage.setItem('v2_tenant_uuid', response.tenantUuid);

    if (response.currentOrganizationUuid) {
      this.localStorage.setItem('v2_organization_uuid', response.currentOrganizationUuid);
    }

    this.localStorage.setItem('v2_user', JSON.stringify(response.user));

    this.localStorage.setItem('v2_organizations', JSON.stringify(response.accessibleOrganizations));

  }

  getTenantUuid(): string | null {
    return this.localStorage.getItem('v2_tenant_uuid');
  }

  getOrganizationUuid(): string | null {
    return this.localStorage.getItem('v2_organization_uuid');
  }

  getUser(): UserV2Response | null {
    const value = this.localStorage.getItem('v2_user');
    return value ? JSON.parse(value) : null;
  }

  getOrganizations(): AccessibleOrganizationResponse[] {
    const value = this.localStorage.getItem('v2_organizations');
    return value ? JSON.parse(value) : [];
  }

  getCurrentOrganization(): AccessibleOrganizationResponse | null {
    const uuid = this.getOrganizationUuid();
    if (!uuid) {
      return null;
    }
    return this.getOrganizations().find(org => org.uuid === uuid) ?? null;
  }

  clear(): void {
    this.localStorage.removeItem('v2_access_token');
    this.localStorage.removeItem('v2_tenant_uuid');
    this.localStorage.removeItem('v2_organization_uuid');
    this.localStorage.removeItem('v2_user');
    this.localStorage.removeItem('v2_organizations');
  }

}