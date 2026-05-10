import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { TypePaiement } from '../../../../../core/models/referentiels/type-paiement';
import { ReferentielService } from '../../service/referentiel.service';

@Component({
  selector: 'app-type-paiement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './type-paiement.component.html',
  styleUrls: ['./type-paiement.component.css']
})
export class TypePaiementComponent implements OnInit {

  errorMessage?: string;
  typePaiements: TypePaiement[] = [];
  typePaiementId?: number;
  typePaiementFormGroup!: FormGroup;

  private readonly referentielService = inject(ReferentielService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);

  ngOnInit(): void {
    this.getTypePaiements();
    this.initializeForm(null);
  }

  getTypePaiements() {
    this.referentielService.getAllTypePaiements().subscribe(
      (data: any[]) => {
        this.typePaiements = data;
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  initializeForm(typePaiement: TypePaiement | null) {
    this.typePaiementFormGroup = this._formBuilder.group({
      id: [typePaiement?.id ? typePaiement.id : ''],
      libelle: [typePaiement?.libelle ? typePaiement.libelle : '', Validators.required],
      montant: [typePaiement?.montant ? typePaiement.montant : '', Validators.required]
    });
  }

  save() {
    const payload = this.typePaiementFormGroup.value;
    console.log("Before saved", payload);
    this.referentielService.createTypePaiement(payload).subscribe({
      next: (data) => {
        this.toastService.success('succès', 'Les informations du type de paiement ont été enregistrées avec succès !!! ');
        console.log("After saved", data);
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    });
  }


}
