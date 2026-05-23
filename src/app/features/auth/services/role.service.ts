import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { ADMIN_ROLES, ROLE_ROUTES, RoleType } from '../../../core/constants/role-routes.constants';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly localStorage = inject(LocalStorageService);

  normalizeRole(role: string): string {
    if (!role) return '';

    return role
      .toLowerCase()
      .trim()
      .replace(/'/g, '')
      .replace(/\s+/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  setRole(role: string): void {
    const normalizedRole = this.normalizeRole(role);
    this.localStorage.setItem('role', normalizedRole);
  }

  getCurrentRole(): string | null {
    return this.localStorage.getItem('role');
  }

  hasRole(role: RoleType | string): boolean {
    const currentRole = this.getCurrentRole();
    const normalizedRole = typeof role === 'string' ? this.normalizeRole(role) : role;
    return currentRole === normalizedRole;
  }

  isAdmin(): boolean {
    const currentRole = this.getCurrentRole();
    return ADMIN_ROLES.includes(currentRole || '');
  }

  getRouteForRole(role: string): string {
    return ROLE_ROUTES[role] || ROLE_ROUTES['default'] || '/login';
  }

  getPermissions(): any {
    const permissions = this.localStorage.getItem('permissions');
    return permissions ? JSON.parse(permissions) : null;
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions?.actions?.includes(permission) || false;
  }
}