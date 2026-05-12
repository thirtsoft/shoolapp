import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../../../../core/services/local-storage.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';

@Component({
  selector: 'app-parent-profile',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './parent-profile.component.html',
  styleUrls: ['./parent-profile.component.css']
})
export class ParentProfileComponent implements OnInit {
  errorMessage?: string;
  utilisateur?: Utilisateur = {};
  userId?: number;

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly localeStorage = inject(LocalStorageService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getConnectedUserInfos();
  }

  getConnectedUserInfos() {
    this.userId = Number(localStorage.getItem('id'));
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });

  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  goToProfil() {
    this.router.navigate(['/admin/utilisateur/monprofil', this.userId]);
  }

  logout() {
    this.localeStorage.clear();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  goBack() {
    this.router.navigate(['parent/dashboard']);
  }

}
