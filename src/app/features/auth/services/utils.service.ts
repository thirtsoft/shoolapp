import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SignInResponse } from '../../../core/models/auth/sign-in-response';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { ADMIN_ROLES, ROLE_ROUTES, RoleType } from '../../../core/constants/role-routes.constants';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  role: any;
  actions: any;
  code: any;
  token: any;

  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);


  afterLoginSuccessful(response: SignInResponse, urlNavigation: string) {

    this.saveUserData(response);

    // Normalisation et sauvegarde du rôle
    const roleCode = response?.profilReponse?.code;
    const normalizedRole = this.roleService.normalizeRole(roleCode);

    console.log('Role original:', roleCode);
    console.log('Role normalisé:', normalizedRole);


    this.roleService.setRole(roleCode);
    this.localStorage.setItem('permissions', JSON.stringify(response.profilReponse));

    // Redirection
    this.redirectAfterLogin(normalizedRole, urlNavigation);

    /*
    this.localStorage.setItem('token', response.token);
    this.localStorage.setItem('id', response.id);
    this.localStorage.setItem('matricule', response.typeCompte);
    this.localStorage.setItem('email', response.email);
    this.localStorage.setItem('name', response.name);
    this.localStorage.setItem('typeUtilisateur', response.typeCompte);
    this.token = response.token;
    this.role = response?.profilReponse?.code;
    console.log(this.role);
    this.localStorage.setItem('role', response.profilReponse.code);
    this.localStorage.setItem('permissions', JSON.stringify(response.profilReponse));
    if (this.role) {
      this.router.navigateByUrl('/admin');
    }

    switch (this.role) {
      case 'Agent, Admin':
        this.router.navigateByUrl('/admin');
        break;
      case 'Parent':
        this.router.navigateByUrl('/parent');
        break;
      case 'Enseignant':
        this.router.navigateByUrl('/enseignant');
        break;
    }*/
  }

  private saveUserData(response: SignInResponse): void {
    const userData = {
      token: response.token,
      id: response.id,
      matricule: response.typeCompte,
      email: response.email,
      name: response.name,
      typeUtilisateur: response.typeCompte
    };

    Object.entries(userData).forEach(([key, value]) => {
      if (value) {
        this.localStorage.setItem(key, value);
      }
    });
  }

  private redirectAfterLogin(role: string, fallbackUrl?: string): void {
    if (fallbackUrl && fallbackUrl !== '/' && fallbackUrl !== '') {
      this.router.navigateByUrl(fallbackUrl);
      return;
    }

    const route = this.roleService.getRouteForRole(role);
    this.router.navigateByUrl(route);
  }

  logout(): void {
    this.localStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
