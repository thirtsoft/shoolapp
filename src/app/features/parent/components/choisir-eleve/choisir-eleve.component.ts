import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EleveResume } from '../../../../core/models/dossiereleve/eleve/eleve-resume.model';
import { ParentResponse } from '../../../../core/models/parent/parent-eleves-response.model';
import { LocalStorageService } from '../../../../core/services/local-storage.service';

import { ParentSessionService } from '../../service/parent-session.service';
import { ParentService } from '../../service/parent.service';

@Component({
  selector: 'app-choisir-eleve',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './choisir-eleve.component.html',
  styleUrls: ['./choisir-eleve.component.css']
})
export class ChoisirEleveComponent implements OnInit {

  parentDetails?: ParentResponse;
  eleveList: EleveResume[] = [];

  private readonly parentService = inject(ParentService);
  private readonly sessionService = inject(ParentSessionService);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);

  ngOnInit(): void {
    this.getDetailsParent();
  }

  getDetailsParent(): void {
    this.parentService.getMesElevest().subscribe({
      next: (res) => {
        this.parentDetails = res;
        this.eleveList = res?.eleves ?? [];
        const parentData = {
          id: res.id,
          parentUuid: res.parentUuid,
          nom: res.nom,
          prenom: res.prenom,
          telephone: res.telephone,
          email: res.email,
          profession: res.profession,
          civility: res.civility,
        }

        this.sessionService.initialiserEleves(this.eleveList);
        this.sessionService.setParentDetails(parentData);
      },

      error: (error) => {
        console.error(
          '❌ Erreur récupération élèves parent :',
          error
        );

      }

    });
  }

  afficherLesEleves(): EleveResume[] {
    return this.eleveList;
  }


  getAvatar(eleve: EleveResume): string {
    const prenom = (eleve?.prenom || '').toLowerCase();
    const prenomsFeminins = [
      'fatima',
      'aminata',
      'aïcha',
      'mariama',
      'khady',
      'ndeye',
      'fatou',
      'aida',
      'codou',
      'rama',
      'awa',
      'mata',
      'nazi',
      'astou',
      'maimouna',
      'sokhna',
      'coumba',
      'dieynaba',
      'bineta',
      'adja',
      'nabou',
      'yacine',
      'amy',
      'sophie',
      'marie',
      'anna',
      'léa',
      'chloé',
      'emma',
      'sarah',
      'inès',
      'lina',
      'julie',
      'laura',
      'lucie',
      'clara',
      'manon'
    ];

    return prenomsFeminins.includes(prenom)
      ? '👧'
      : '👦';
  }

  getAvatarBg(eleve: EleveResume): string {
    const prenom = (eleve?.prenom || '').toLowerCase();
    const prenomsFeminins = [
      'fatima',
      'aminata',
      'aïcha',
      'mariama',
      'khady',
      'ndeye',
      'fatou',
      'aida',
      'codou',
      'rama',
      'awa',
      'mata',
      'nazi',
      'astou',
      'maimouna',
      'sokhna',
      'coumba',
      'dieynaba',
      'bineta',
      'adja',
      'nabou',
      'yacine',
      'amy',
      'sophie',
      'marie',
      'anna',
      'léa',
      'chloé',
      'emma',
      'sarah',
      'inès',
      'lina',
      'julie',
      'laura',
      'lucie',
      'clara',
      'manon'
    ];

    return prenomsFeminins.includes(prenom) ? 'avatar-fille' : 'avatar-garcon';
  }

  afficherDossier(eleve: EleveResume): void {
    if (eleve?.id == null) {
      console.error('❌ Aucun ID élève trouvé', eleve);
      return;
    }
    this.sessionService.setEleveActif(eleve);

    this.goToDashboard();
  }

  goToDashboard(): void {
    void this.router.navigate(['/parent/dashboard']);
  }

  deconnecter(): void {
    this.sessionService.clear();
    this.localStorage.clear();
    void this.router.navigate(['/auth/login/v2']);
  }
}