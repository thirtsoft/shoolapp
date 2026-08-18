import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-initier-annee-scolaire-component',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './initier-annee-scolaire-component.html',
  styleUrl: './initier-annee-scolaire-component.css',
})
export class InitierAnneeScolaireComponent {


  anneeScolaire = {
    libelle: '2026-2027',
    dateDebut: '2026-10-01',
    dateFin: '2027-07-31',
    statut: 'Année en cours',
  };

  readonly anneesDisponibles = [
    '2026-2027',
    '2027-2028',
    '2028-2029',
  ];

  onAnneeChange(): void {

    const [anneeDebut] = this.anneeScolaire.libelle.split('-');

    const anneeFin = Number(anneeDebut) + 1;

    this.anneeScolaire.dateDebut = `${anneeDebut}-10-01`;
    this.anneeScolaire.dateFin = `${anneeFin}-07-31`;
  }
}