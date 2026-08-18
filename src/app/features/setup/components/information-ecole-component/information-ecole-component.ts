import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-information-ecole-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './information-ecole-component.html',
  styleUrl: './information-ecole-component.css',
})
export class InformationEcoleComponent {

  ecole = {
    nom: 'École Privée Les Pionniers',
    sigle: 'EPP',
    type: 'Établissement privé',
    statut: 'Privé',
    adresse: 'Dakar, Sénégal',
    telephone: '+221 77 123 45 67',
    email: 'contact@lespionniers.sn',
    siteWeb: '',
    directeur: 'M. Abdoulaye Diallo',
    anneeCreation: 2012,
  };

}
