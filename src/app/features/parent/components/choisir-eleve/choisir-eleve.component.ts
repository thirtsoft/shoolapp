import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
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
  parentDetails: ParentDetails = {};
  eleveList: any[] = [];
  TotalElevesLength: any;

  private readonly parentService = inject(ParentService);
  private readonly router = inject(Router);
  private readonly localStorage = inject(LocalStorageService);

  constructor() {
    this.userId = this.localStorage.getItem('id');
  }

  ngOnInit(): void {
    if (this.userId) {
      this.getDetailsParent(this.userId);
    }
  }

  getDetailsParent(parentId: number) {
    this.parentService.getDetailsParent(parentId)
      .subscribe(res => {
        this.parentDetails = res;
        this.eleveList = res?.eleveParentDTOList || [];
        console.log('parent', this.parentDetails);
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

  /** Retourne la classe CSS de fond selon le genre */
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
    this.localStorage.setItem("eleveId", eleve?.id);
    this.localStorage.setItem("classeId", eleve?.classeId);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/parent/dashboard']);
    });
  }

  deconnecter(): void {
    this.localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}