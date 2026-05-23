import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { ListeEleve } from '../../../../../../core/models/dossiereleve/liste-eleve';
import { AnneeScolaire } from '../../../../../../core/models/referentiels/annee-scolaire';
import { ListeClasse } from '../../../../../../core/models/referentiels/classe';
import { Semestre } from '../../../../../../core/models/referentiels/semestre';
import { ReferentielResourceService } from '../../../../referentiel/service/referentiel-resource.service';
import { DossierResourceService } from '../../../service/dossier-resource.service';

@Component({
  selector: 'app-create-bulletin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-bulletin.component.html',
  styleUrls: ['./create-bulletin.component.css']
})
export class CreateBulletinComponent implements OnInit {

  errorMessage?: string;
  eleveList?: ListeEleve[] = [];
  semestreList?: Semestre[] = [];
  anneeScolaireList?: AnneeScolaire[] = [];
  classeList?: ListeClasse[] = [];
  selectedClass: any;
  selectedEleve: any;
  selectedSemestre: any;
  selectedAnneeScolaire: any;
  title = "Générer les bulletins pour l'élève";

  private readonly dossierResource = inject(DossierResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.getClasseList();
    this.getSemestreList();
    this.getAnneeScolaireList();
  }

  getClasseList() {
    this.referentielResource.getResourceList('classe')?.subscribe({
      next: (data: any) => {
        this.classeList = data;
      }
    });
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
    if (this.selectedClass) {
      this.getEleveList(this.selectedClass);
    }
  }

  getEleveList(classId: number) {
    this.dossierResource.getResourceListByElement('inscription/classe', classId)?.subscribe({
      next: (data: any) => {
        this.eleveList = data;
      }
    });
  }

  getSelectedEleveName(): string {
    const eleve = this.eleveList?.find(e => Number(e.eleve) === Number(this.selectedEleve));
    return eleve?.nomCompletEleve || '';
  }


  onEleveSelected() {
    console.log('selectedEleve', this.selectedEleve);
  }

  onSemestreSelected() {
    console.log('selectedSemestre', this.selectedSemestre);
  }

  onAnneeScolaireSelected() {
    console.log('selectedAnneeScolaire', this.selectedAnneeScolaire);
  }

  genererBulletinPourUnEleve() {
    this.dossierResource.genererBulletinEleveResource('bulletin', this.selectedEleve, this.selectedSemestre, this.selectedAnneeScolaire).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', data.message);
          this.router.navigate(['admin/dossier-eleve/bulletin'])
        } else if (data.statut === 'NOCONTENT') {
          this.router.navigate(['admin/dossier-eleve/bulletin'])
        }
        else if (data.statut === 'FAILED') {
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
