import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
        console.log('classeList', this.classeList);
      }
    });
  }

  getSemestreList() {
    this.referentielResource.getResourceList('semestre')?.subscribe({
      next: (data: any) => {
        this.semestreList = data;
        console.log('semestreList', this.semestreList);
      }
    });
  }

  getAnneeScolaireList() {
    this.referentielResource.getResourceList('anneescolaire')?.subscribe({
      next: (data: any) => {
        this.anneeScolaireList = data;
        console.log('anneeScolaireList', this.anneeScolaireList);
      }
    });
  }

  onClasseSelected() {
    console.log('selectedClasse', this.selectedClass);
    if (this.selectedClass) {
      this.getEleveList(this.selectedClass);
    }
  }

  getEleveList(classId: number) {
    this.dossierResource.getResourceListByElement('inscription/classe', classId)?.subscribe({
      next: (data: any) => {
        this.eleveList = data;
        console.log('liste eleve', this.eleveList);
      }
    });
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
