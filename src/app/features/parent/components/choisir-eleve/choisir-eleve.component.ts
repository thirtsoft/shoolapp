import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParentElevesResponse } from '../../../../core/models/parent/parent-eleves-response.model';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { ParentService } from '../../service/parent.service';

@Component({
  selector: 'app-choisir-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './choisir-eleve.component.html',
  styleUrls: ['./choisir-eleve.component.css']
})
export class ChoisirEleveComponent implements OnInit {

  userId?: number;
  useUuId?: string;
  parentDetails?: ParentElevesResponse;
  eleveList: any;
  TotalElevesLength: any;

  private readonly parentService = inject(ParentService);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);

  constructor() {
    this.userId = this.localStorage.getItem('id');
  }

  ngOnInit(): void {
    /*     const userData = this.localStorage.getItem('v2_user');
        this.useUuId = userData.uuid
        if (this.useUuId) {
          
        } */

    this.getDetailsParent();
  }

  getDetailsParent() {
    this.parentService.getMesElevest().subscribe({
      next: (res) => {
        console.log('✅ Parent / élèves :', res);

        this.parentDetails = res;
        this.eleveList = res?.eleves ?? [];
      },
      error: (error) => {
        console.error('❌ Erreur récupération élèves parent :', error);
      }
    });
  }

  afficherLesEleves(): any[] {
    return this.eleveList;
  }

  getAvatar(eleve: any): string {
    const prenom = (eleve?.prenom || '').toLowerCase();
    const prenomsFeminins = [
      'fatima', 'aminata', 'aïcha', 'mariama', 'khady', 'ndeye', 'fatou',
      'aida', 'codou', 'rama', 'awa', 'mata', 'nazi', 'astou', 'maimouna',
      'sokhna', 'coumba', 'dieynaba', 'bineta', 'adja', 'nabou', 'yacine',
      'amy', 'sophie', 'marie', 'anna', 'léa', 'chloé', 'emma', 'sarah',
      'inès', 'lina', 'julie', 'laura', 'lucie', 'clara', 'manon'
    ];

    if (prenomsFeminins.includes(prenom)) {
      return '👧';
    }
    return '👦';
  }

  getAvatarBg(eleve: any): string {
    const prenom = (eleve?.prenom || '').toLowerCase();
    const prenomsFeminins = [
      'fatima', 'aminata', 'aïcha', 'mariama', 'khady', 'ndeye', 'fatou',
      'aida', 'codou', 'rama', 'awa', 'mata', 'nazi', 'astou', 'maimouna',
      'sokhna', 'coumba', 'dieynaba', 'bineta', 'adja', 'nabou', 'yacine',
      'amy', 'sophie', 'marie', 'anna', 'léa', 'chloé', 'emma', 'sarah',
      'inès', 'lina', 'julie', 'laura', 'lucie', 'clara', 'manon'
    ];
    return prenomsFeminins.includes(prenom) ? 'avatar-fille' : 'avatar-garcon';
  }

  afficherDossier(eleve: any) {
    console.log('📚 Élève sélectionné :', eleve);

    if (!eleve?.id) {
      console.error('❌ Aucun ID élève trouvé', eleve);
      return;
    }

    this.localStorage.setItem('eleveId', eleve.id);

    if (eleve?.classeId) {
      this.localStorage.setItem('classeId', eleve.classeId);
    }

    console.log('➡️ Navigation vers /parent/dashboard');

    this.router.navigate(['/parent/dashboard']);
  }

  deconnecter(): void {
    this.localStorage.clear();
    this.router.navigate(['/auth/login/v2']);
  }
}