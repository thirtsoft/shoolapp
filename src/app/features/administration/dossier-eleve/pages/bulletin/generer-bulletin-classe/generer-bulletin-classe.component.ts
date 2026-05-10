import { Component, inject, OnInit } from '@angular/core';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { DossierResourceService } from '../../../service/dossier-resource.service';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


interface Mois {
  id: number;
  libelle: string;
}

@Component({
  selector: 'app-generer-bulletin-classe',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './generer-bulletin-classe.component.html',
  styleUrls: ['./generer-bulletin-classe.component.css']
})
export class GenererBulletinClasseComponent implements OnInit {

  errorMessage?: string;
  classList?: ListeClasse[] = [];
  semestreList?: Semestre[] = [];
  anneeScolaireList?: AnneeScolaire[] = [];
  selectedClasse: any;
  selectedSemestre: any;
  selectedAnneeScolaire: any;
  title = "Générer les bulletins pour une classe";

  private readonly dossierResource = inject(DossierResourceService);
  //  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  //  private readonly localStorage = inject(LocalStorageService);

  ngOnInit(): void {
    //    this.getClassList();
    //    this.getSemestreList();
    //    this.getAnneeScolaireList();
  }

  /*
  getClassList() {
    this.referentielResource.getResourceList('classe')?.subscribe({
      next: (data) => {
        this.classList = data;
        console.log('classList', this.classList);
      }
    });
  }

  getSemestreList() {
    this.referentielResource.getResourceList('semestre')?.subscribe({
      next: (data) => {
        this.semestreList = data;
        console.log('semestreList', this.semestreList);
      }
    });
  }

  getAnneeScolaireList() {
    this.referentielResource.getResourceList('anneescolaire')?.subscribe({
      next: (data) => {
        this.anneeScolaireList = data;
        console.log('anneeScolaireList', this.anneeScolaireList);
      }
    });
  }
    */

  onClasseSelected() {
    console.log('selectedTypeService', this.selectedClasse);
  }

  onSemestreSelected() {
    console.log('selectedMois', this.selectedSemestre);
  }

  onAnneeScolaireSelected() {
    console.log('selectedAnnee', this.selectedAnneeScolaire);
  }



  genererBulletinPourUneClasse() {
    console.info("Classe selected", this.selectedClasse);
    console.info("semestre selected", this.selectedSemestre);
    console.info("annee scolaire selected", this.selectedAnneeScolaire);
    return;
    this.dossierResource.genererUneResource('bulletin/generer', this.selectedClasse, this.selectedSemestre, this.selectedAnneeScolaire).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les factures pour cette classe ont a été enregistrées avec succès !!! ');
          this.router.navigate(['admin/dossier-eleve/bulletin'])
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

  goBack() {
    this.router.navigate(['admin/dossier-eleve/bulletin'])
  }


}
