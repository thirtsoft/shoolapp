import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';


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
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getClassList();
    this.getSemestreList();
    this.getAnneeScolaireList();
  }

  getClassList() {
    this.referentielResource.getResourceList('classe')?.subscribe({
      next: (data: any) => {
        this.classList = data;
      }
    });
  }

  getSelectedClasseName(): string {
    const classe = this.classList?.find(s => Number(s.id) === Number(this.selectedClasse));
    return classe?.libelle || '';
  }

  getSemestreList() {
    this.referentielResource.getResourceList('semestre')?.subscribe({
      next: (data: any) => {
        this.semestreList = data;
      }
    });
  }

  getSelectedSemestreName(): string {
    const semestre = this.semestreList?.find(s => Number(s.id) === Number(this.selectedSemestre));
    return semestre?.libelle || '';
  }

  getAnneeScolaireList() {
    this.referentielResource.getResourceList('anneescolaire')?.subscribe({
      next: (data: any) => {
        this.anneeScolaireList = data;
      }
    });
  }


  getSelectedAnneeName(): string {
    const annee = this.anneeScolaireList?.find(a => Number(a.id) === Number(this.selectedAnneeScolaire));
    return annee?.libelle || '';
  }

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
