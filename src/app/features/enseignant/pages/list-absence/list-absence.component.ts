import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Conge } from '../../../../core/models/enseignant/conge';
import { ListeConge } from '../../../../core/models/enseignant/liste-conge';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { EnseignantService } from '../../service/enseignant.service';

@Component({
  selector: 'app-list-absence',
  standalone: true,
  imports: [DatePipe, RouterLink, CommonModule],
  templateUrl: './list-absence.component.html',
  styleUrls: ['./list-absence.component.css']
})
export class ListAbsenceComponent implements OnInit {

  congesList: ListeConge[] = [];
  errorMessage?: string;
  conge: Conge = {};
  congeId?: number;
  userId: number;

  sizeNull?: number;

  congesFormGroup!: FormGroup;

  private readonly localStorage = inject(LocalStorageService);
  private readonly toastService = inject(ToastrService)
  private readonly enseignantService = inject(EnseignantService);
  private readonly _formBuilder = inject(FormBuilder);

  constructor(
  ) {
    this.userId = Number(this.localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.getConges();
    this.initializeForm(null);
  }

  getConges() {
    this.enseignantService.getAllConges()
      .subscribe(res => {
        this.congesList = res;
        console.log(this.congesList);
        if (this.congesList.length > 0) {
          this.sizeNull = 1;
        } else {
          this.sizeNull = 0;
        }
      },
        error => this.errorMessage = <any>error);
  }

  getConge(congeId: number) {
    this.enseignantService.getConge(congeId).subscribe(
      (data: any) => {
        this.conge = data;
        this.initializeForm(this.conge);
      },
      (error) => (this.errorMessage = <any>error)
    );
  }


  initializeForm(conge: Conge | null) {
    this.congesFormGroup = this._formBuilder.group({
      id: [conge?.id ? conge.id : ''],
      objet: [conge?.objet ? conge?.objet : '', Validators.required],
      motif: [conge?.motif ? conge?.motif : '', Validators.required],
      //     dateDebut: [moment(conge?.dateDebut).format('YYYY-MM-DD')],
      //     dateFin: [moment(conge?.dateFin).format('YYYY-MM-DD')],

      dateDebut: [conge?.dateDebut],
      dateFin: [conge?.dateFin],
    });
  }


  save() {
    this.conge = {
      id: this.congesFormGroup.get("id")!.value,
      objet: this.congesFormGroup.get("objet")!.value,
      motif: this.congesFormGroup.get("motif")!.value,
      dateDebut: this.congesFormGroup.get("dateDebut")!.value,
      dateFin: this.congesFormGroup.get("dateFin")!.value,
      enseignantDTO: {
        id: this.userId
      }
    }
    this.enseignantService.ajouterConge(this.conge).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les informations du congé ont été enregistrées avec succès !!! ');
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


  editer() {
    this.conge = {
      id: this.congesFormGroup.get("id")!.value,
      objet: this.congesFormGroup.get("objet")!.value,
      motif: this.congesFormGroup.get("motif")!.value,
      dateDebut: this.congesFormGroup.get("dateDebut")!.value,
      dateFin: this.congesFormGroup.get("dateFin")!.value,
      enseignantDTO: {
        id: this.userId
      }
    }
    this.enseignantService.updateConge(this.congeId!, this.conge).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les informations du congé ont été modifiées avec succès !!! ');
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la modification : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la modification : ' + data.error);
      }
    });

  }

  sendConges() {
    this.enseignantService.sendConge(this.congeId!).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Votre demande de congé a été envoyé avec succès !!! ');
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de l\'envoyé de la demande de congé : ' + data.message);
        }
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de l\'envoyé de la demande de congé : ' + data.error);
      }
    });

  }

  deleteConges() {
    this.congesList = this.congesList.filter((a) => a.id !== this.congeId);
    this.enseignantService.deleteConge(this.congeId).subscribe((data: any) => {
      this.toastService.error('succès', 'Les informations du congés ont été supprimées avec succès !!! ');
    });
  }

}