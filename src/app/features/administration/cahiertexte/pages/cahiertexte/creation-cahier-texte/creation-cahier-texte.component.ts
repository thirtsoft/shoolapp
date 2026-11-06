import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CahierDeTexteResponse } from '../../../../../../core/models/cahier-texte/cahier-texte-response.model';
import { CahierDeTexteRequest } from '../../../../../../core/models/cahier-texte/cahiers-textes-request.model';
import { AnneeScolaireEncoursResponse } from '../../../../../../core/models/referentiels/annee-scolaire-encours-response';
import { ClasseListResponse } from '../../../../../../core/models/referentiels/classe';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { CahierTexteResourceService } from '../../../services/chaier-texte-resource.service';

@Component({
  selector: 'app-creation-cahier-texte',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './creation-cahier-texte.component.html',
  styleUrls: ['./creation-cahier-texte.component.css']
})
export class CreationCahierTexteComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cahierDeTexteService = inject(CahierTexteResourceService);

  cahiertexte?: CahierDeTexteResponse;
  cahiertexteId?: number;

  errorMessage!: string;

  title = "Créer un cahier texte";

  cahiertexteFormGroup!: FormGroup;

  isEdit: boolean = false;

  today = new Date();

  classes: ClasseListResponse[] = [];
  anneeScolaires: AnneeScolaireEncoursResponse[] = [];


  private readonly referentielService = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeCahierTexetForm(null);
    this.getClasses();
    this.getAnneeScolaires();

    this.cahiertexteId = this.route.snapshot.params['id'];

    if (this.cahiertexteId != null && this.cahiertexteId != undefined) {
      this.getCahiertexte(this.cahiertexteId);
      this.title = 'Modifier un cahier Texte';
      this.isEdit = true;
    }
  }


  getCahiertexte(cahiertexteId: number) {
    this.cahierDeTexteService.getSingleResource('cahier-texte', cahiertexteId).subscribe({
      next: (data) => {
        this.cahiertexte = data as CahierDeTexteResponse;
        this.initializeCahierTexetForm(this.cahiertexte);
      }
    });
  }


  getClasses() {
    this.referentielService.getResourceList('classe/response').subscribe(
      (data: any[]) => {
        this.classes = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getSelectedClasseName(): string {
    const classeUuid = this.cahiertexteFormGroup.get('classeUuid')?.value;
    if (!classeUuid || !this.classes || this.classes.length === 0) {
      return '';
    }
    const classe = this.classes.find(c => Number(c.uuid) === Number(classeUuid));
    return classe?.libelle ?? '';
  }

  getAnneeScolaires() {
    this.referentielService.getResourceList('anneescolaire/response').subscribe(
      (data: any[]) => {
        this.anneeScolaires = data;
      },
      (error: any) => (this.errorMessage = <any>error)
    );
  }

  getSelectedAnneeName(): string {
    const anneeUuiId = this.cahiertexteFormGroup.get('anneeScolaireUuid')?.value;
    if (!anneeUuiId || !this.anneeScolaires || this.anneeScolaires.length === 0) {
      return '';
    }
    const annee = this.anneeScolaires.find(c => c.anneeScolaireUuid === anneeUuiId);
    return annee?.libelle ?? '';
  }

  initializeCahierTexetForm(cahierTexte: CahierDeTexteRequest | null) {
    this.cahiertexteFormGroup = this._formBuilder.group({
      classeUuid: [cahierTexte?.classeUuid ?? '', Validators.required],
      anneeScolaireUuid: [cahierTexte?.anneeScolaireUuid ?? '', Validators.required],
    });
  }


  ajouterEditCahierTexte() {
    const payload = this.cahiertexteFormGroup.value;
    if (!this.isEdit) {
      this.cahierDeTexteService.createCahierTexte(payload).subscribe({
        next: (data) => {
          if (data.numero != null) {
            this.toastService.success('succès', 'Le cahier de texte a été crée avec succès !!! ');
            this.goBack();
          } else if (!data.numero) {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.numero);
          }
        },

        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.cahierDeTexteService.updateCahierTexte(this.cahiertexteId!, payload).subscribe({
        next: (data) => {
          if (data.numero) {
            this.toastService.success('succès', 'Le cahier de texte a été modifiée avec succès !!! ');
            this.goBack();
          } else if (!data.numero) {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.numero);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });
    }

  }

  goBack() {
    void this.router.navigate(['admin/cahiers-textes'])
  }
}