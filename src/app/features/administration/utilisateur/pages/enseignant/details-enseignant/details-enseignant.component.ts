import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DetailsEnseignant } from '../../../../../../core/models/enseignant/details-enseignant';
import { EnseignantService } from '../../../../../enseignant/service/enseignant.service';

@Component({
  selector: 'app-details-enseignant',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './details-enseignant.component.html',
  styleUrls: ['./details-enseignant.component.css']
})
export class DetailsEnseignantComponent implements OnInit {


  enseignant?: DetailsEnseignant;
  enseignantId?: number;
  preview = '';
  title = 'Détails de l\'enseignant';
  activeTab: 'infos' | 'conges' | 'cours' | 'enseignements' = 'infos';

  private readonly enseignanService = inject(EnseignantService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.enseignantId = this.activeRoute.snapshot.params['id'];
    if (this.enseignantId) {
      this.getDetailsEnseignant(this.enseignantId);
    }
  }

  getDetailsEnseignant(enseignantId: number): void {
    this.enseignanService.getDetailsEnseigant(enseignantId).subscribe({
      next: (data) => {
        this.enseignant = data;

        if (this.enseignant?.piecesJointesDTO?.content) {
          this.preview = 'data:image/png;base64,' + this.enseignant.piecesJointesDTO.content;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.toastService.error('Impossible de charger les détails de l\'enseignant');
        this.goBack();
      }
    });
  }

  setActiveTab(tab: 'infos' | 'conges' | 'cours' | 'enseignements'): void {
    this.activeTab = tab;
  }

  goBack(): void {
    this.router.navigate(['/admin/utilisateur/enseignants']);
  }

}