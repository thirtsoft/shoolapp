import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Utilisateur } from '../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../../administration/utilisateur/service/utilisateur.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';


@Component({
  selector: 'app-side-menu-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './side-menu-enseignant.component.html',
  styleUrls: ['./side-menu-enseignant.component.css']
})
export class SideMenuEnseignantComponent implements OnInit {

  page = 'Dashboard';
  showDropdown = true;
  public bellCollapsed = true;
  public userCollapsed = true;

  userId: number | null | undefined;
  utilisateur: Utilisateur = {};

  private readonly userService = inject(UtilisateurService);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);
  
  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
  }
  ngOnInit(): void {
    if (this.userId) {
      this.getUtilisateurProfil(this.userId);
    }
  }

  getUtilisateurProfil(userId: number) {
    this.userService.getUtilisateurProfil(userId).subscribe({
      next: (data) => {
        this.utilisateur = data;
        console.log(this.utilisateur);
      },
      error: error => {
        
      }
    })
  }

  ngAfterViewInit() {
    this.loadDynmicallyScript('assets/admin/js/script.js');
  }
  loadDynmicallyScript(js:any) {
    var script = document.createElement('script');
    script.src = js;
    script.async = false;
    document.head.appendChild(script);
    script.onload = () => this.doSomethingWhenScriptIsLoaded();
  }

  doSomethingWhenScriptIsLoaded() {}
  change(name:any) {
    this.page = name;
  }

  clickLogout() {
    window.location.href = '/home';
  }

  bell() {
    this.bellCollapsed = !this.bellCollapsed;
    if (!this.userCollapsed) {
      this.userCollapsed = true;
    }
  }
  user() {
    this.userCollapsed = !this.userCollapsed;
    if (!this.bellCollapsed) {
      this.bellCollapsed = true;
    }
  }

  goToProfil() {
    this.router.navigate(['/admin/doc-profile', this.userId]);
  }

  logout() {
    this.localStorage.clear();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}
