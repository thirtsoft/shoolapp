import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SignInResponse } from '../../../core/models/auth/sign-in-response';
import { LocalStorageService } from '../../../core/services/local-storage.service';

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


  afterLoginSuccessful(response: SignInResponse, urlNavigation: string) {
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
    }
  }
}
