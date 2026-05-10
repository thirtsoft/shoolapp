import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';


@Component({
  selector: 'app-affecter-enseignant',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './affecter-enseignant.component.html',
  styleUrls: ['./affecter-enseignant.component.css']
})
export class AffecterEnseignantComponent implements OnInit {

  errorMessage?: string;
  affecterId?: number;
  affecterFormGroup!: FormGroup;
  affecter: any;
  isEdit: boolean = false;
  classList?: ListeClasse[] = [];
  anneescolaireListe?: AnneeScolaire[] = [];

  title = "Affecter une classe à un enseignant";

  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activeRoute = inject(ActivatedRoute);

  ngOnInit(): void { }

  ajouteditEnseignement(): void {}

  goBack() {
    this.router.navigate(['admin/referentiels/annee-scolaire'])
  }

  /*
  private readonly enseignantService = inject(EnseignantService);
  private readonly referentielService = inject(ReferentielService);
  private readonly planificationService = inject(PlanificationResourceService);
  private readonly toastService = inject(ToastrService);



  ngOnInit(): void {
    this.affecterId = this.activeRoute.snapshot.params['id'];
    this.getListClass();
    this.getListAnneeSclaire();
    this.initializeForm(null);
    if (this.affecterId != null && this.affecterId != undefined) {
      this.getAffectation(this.affecterId);
      this.title = 'Modifier une année scolaire';
      this.isEdit = true;
    }
  }

  getListClass() {
    this.referentielService.getAllClasses().subscribe({
      next: (data) => {
        this.classList = data;
      }
    });
  }

  getListAnneeSclaire() {
    this.referentielService.getAllAnneeScolaires().subscribe({
      next: (data) => {
        this.anneescolaireListe = data;
      }
    });
  }


  getAffectation(anneeScolaireId: number) {
    this.planificationService.getEnseignement(anneeScolaireId).subscribe({
      next: (data) => {
        this.affecter = data;
        this.initializeForm(this.affecter);
      }
    });
  }


  initializeForm(enseignement: Enseignement | null) {
    this.affecterFormGroup = this._formBuilder.group({
      id: [enseignement?.id ? enseignement.id : ''],
      classe: [enseignement?.classe ? enseignement.classe : '', Validators.required],
      anneeScolaire: [enseignement?.anneeScolaire ? enseignement.anneeScolaire : '', Validators.required],
      description: [enseignement?.description ? enseignement.description : ''],
    });
  }


  ajouteditEnseignement() {
    const payload = this.affecterFormGroup.value;
    payload.enseignant = this.affecterId;
    console.log('info {} ', payload);
    if (this.isEdit) {
      this.planificationService.ajouterEnseignement(payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'Les informations de l\'enseignement ont été enregistrées avec succès !!! ');
            this.router.navigate(['admin/utilisateur/enseignant'])
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
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
    this.router.navigate(['admin/referentiels/annee-scolaire'])
  }
    */


}
