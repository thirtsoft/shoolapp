import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Event, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Utilisateur } from '../../core/models/utilisateur/utilisateur';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { DossierEleveService } from '../administration/dossier-eleve/service/dossier-eleve.service';
import { UtilisateurService } from '../administration/utilisateur/service/utilisateur.service';


@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ReactiveFormsModule, RouterOutlet],
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {

  splitVal: any;
  url: any;
  base = 'Parent';
  page = 'Tableau de bord';
  parentSidebar: boolean = true;
  parentDetails: Utilisateur = {};
  userId?: number;
  eleveId?: number;
  classeId?: number;
  eleve: any = {};

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly router = inject(Router);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly localStorage = inject(LocalStorageService);

  constructor(
  ) {
    if (this.router.url === '/doctor/message' || this.router.url === '/doctor/doctor-register') {

      this.parentSidebar = false;
    } else {
      this.parentSidebar = true;
    }

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        if (event.url === '/doctor/message' || event.url === '/doctor/doctor-register') {
          this.parentSidebar = false;
        } else {
          this.parentSidebar = true;
        }
      }
    });
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');

    this.getConnectedUserInfos();
    this.getEleveInfos();
  }

  navigate(name: any) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.splitVal = event.url.split('/');
        console.log('this.splitVal', this.splitVal);
        this.base = this.splitVal[1];
        console.log('this.base', this.base);
        this.page = this.splitVal[2];
        console.log('this.page', this.page);
        if (this.page === "doctor-change-password") {
          this.page = "change password"
        }
      }
    });
  }

  getConnectedUserInfos() {
    const userId = localStorage.getItem('id');
    this.utilisateurService.getUtilisateur(Number(userId)).subscribe({
      next: data => {
        this.parentDetails = data;
      },
      error: error => { console.log(error) },
    });
  }

  getEleveInfos() {
    const userId = Number(localStorage.getItem('id'));
    this.dossierEleveService.getEleve(userId).subscribe({
      next: data => {
        this.eleve = data;
      },
      error: error => { console.log(error) },
    });
  }

  goToMyProfile() {
    this.router.navigate(['/parent/monprofil', this.userId]);
  }

  logout() {
    this.localStorage.clear();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/login-page']);
    });
  }


}
