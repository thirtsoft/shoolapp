import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DetailsEnseignant } from '../../../../../../core/models/enseignant/details-enseignant';
import { DetailsEnseignement } from '../../../../../../core/models/planification/enseignement';
import { ListeCours } from '../../../../../../core/models/planification/liste-cours';
import { PieceJointeService } from '../../../../../../core/services/piece-jointe';
import { CommonModule } from '@angular/common';
import { ReferentielService } from '../../../../referentiel/service/referentiel.service';
import { EnseignantService } from '../../../../../enseignant/service/enseignant.service';
import { ToastrService } from 'ngx-toastr';
import { PlanificationResourceService } from '../../../../planification/services/planification-resource.service';

@Component({
  selector: 'app-details-enseignant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './details-enseignant.component.html',
  styleUrls: ['./details-enseignant.component.css']
})
export class DetailsEnseignantComponent implements OnInit {

  errorMessage?: string;
  enseignantFormGroup!: FormGroup;
  enseignant?: DetailsEnseignant;
  enseignement?: DetailsEnseignement;
  enseignantId?: number;
  userId?: any;
  currentFile?: File;
  message = '';
  preview = '';
  listCours: ListeCours[] = [];

  title = "Ajouter un enseignant";

  private readonly referentielService = inject(ReferentielService);
  private readonly enseignanService = inject(EnseignantService);
  private readonly enseignantService = inject(PieceJointeService);
  private readonly planification = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);


  ngOnInit(): void {
    this.enseignantId = this.activeRoute.snapshot.params['id'];
    if (this.enseignantId != null && this.enseignantId != undefined) {
      //   this.getDetailsEnseignant(this.enseignantId);
      this.title = 'Modifier un enseignant';
    }
  }

  /*
  getDetailsEnseignant(enseignantId: number) {
    this.enseignanService.getDetailsEnseigant(enseignantId).subscribe({
      next: (data) => {
        this.enseignant = data;
        this.userId = this.enseignant.userId;
        this.enseignement = this.enseignant?.detailsEnseignementDTO;

        this.listCours = this.enseignant?.listeCoursDTOS;

        if (this.enseignant?.piecesJointesDTO?.content) {
          this.preview = 'data:image/png;base64,' + this.enseignant.piecesJointesDTO.content;
        }
      }
    });
  }*/

  goBack() {
    this.router.navigate(['/admin/utilisateur/enseignant']);
  }

}
