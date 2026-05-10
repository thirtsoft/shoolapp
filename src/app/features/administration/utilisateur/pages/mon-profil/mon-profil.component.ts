import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterLink } from '@angular/router';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { UtilisateurService } from '../../service/utilisateur.service';
import { ChangerPasswordComponent } from '../../components/changer-password/changer-password.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mon-profil.component.html',
  styleUrls: ['./mon-profil.component.css']
})
export class MonProfilComponent implements OnInit {

  errorMessage?: string;
  utilisateur?: Utilisateur;

  private readonly utilisateurService = inject(UtilisateurService);
  private readonly modalService = inject(NgbModal);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getConnectedUserInfos();
  }

  getConnectedUserInfos() {
    const userId = localStorage.getItem('id');
    this.utilisateurService.getUtilisateur(Number(userId)).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => {console.log(error)},
    });

  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }


  changerPasswordDialog() {
    const modelRef = this.modalService.open(ChangerPasswordComponent, { size: 'lg'});
    modelRef.result.then(data => {
      if (data === 'success') {
        this.logOut();
      }
    })
  }


  goBack() {
    this.router.navigate(['/admin/utilisateur/list']);
  }

}
