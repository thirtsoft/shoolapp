import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlanificationResourceService } from '../../../services/planification-resource.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-details-emploi-du-temps-admin',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './details-emploi-du-temps-admin.component.html',
  styleUrls: ['./details-emploi-du-temps-admin.component.css']
})
export class DetailsEmploiDuTempsAdminComponent implements OnInit {

  emploieId: number;
  emploie: any;
  coursesList: any;
  title = "Détails emploie du temps";

  private readonly planificationService = inject(PlanificationResourceService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.emploieId = this.activeRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    if (this.emploieId != null && this.emploieId != undefined) {
      this.getDetailsEmploiDuTemps(this.emploieId);
      this.title = 'Détails emploie du temps';
    }
  }

  getDetailsEmploiDuTemps(factureId: number) {
    this.planificationService.recupererUneResource('planification/emploidutemps/details', factureId).subscribe({
      next: (data) => {
        this.emploie = data;
        this.coursesList = this.emploie.listeCoursDTOS;
      }
    });
  }

  goBack() {
    this.router.navigate(['admin/planification/emploi-du-temps'])
  }



}
