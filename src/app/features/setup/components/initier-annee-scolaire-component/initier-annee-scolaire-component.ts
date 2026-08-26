import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-initier-annee-scolaire-component',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './initier-annee-scolaire-component.html',
  styleUrl: './initier-annee-scolaire-component.css',
})
export class InitierAnneeScolaireComponent implements OnInit {


  @Input({ required: true })
  tenantUuid!: string;

  @Input({ required: true })
  organizationUuid!: string;

  @Output()
  formValidityChange = new EventEmitter<boolean>();

  readonly form: FormGroup;
  readonly anneesDisponibles: string[];

  constructor(private readonly fb: FormBuilder) {

    const anneeCourante = new Date().getFullYear();

    const anneeParDefaut = this.construireLibelleAnnee(anneeCourante);

    this.anneesDisponibles = this.genererAnneesDisponibles(anneeCourante);

    this.form = this.fb.group({
      id: [null],
      tenantUuid: ['', Validators.required],
      organizationUuid: ['', Validators.required],
      libelle: [anneeParDefaut, Validators.required],
      dateDebut: [this.construireDateDebut(anneeCourante), Validators.required],
      dateFin: [this.construireDateFin(anneeCourante)],
      actif: [true]

    });

  }

  ngOnInit(): void {
    this.form.patchValue({
      tenantUuid: this.tenantUuid,
      organizationUuid: this.organizationUuid
    });

    this.formValidityChange.emit(this.form.valid);

    this.form.statusChanges.subscribe(() => {
      this.formValidityChange.emit(this.form.valid);
    });
  }

  private construireLibelleAnnee(anneeDebut: number): string {
    return `${anneeDebut}-${anneeDebut + 1}`;
  }

  private construireDateDebut(anneeDebut: number): string {
    return `${anneeDebut}-10-01`;
  }

  private construireDateFin(anneeDebut: number): string {
    return `${anneeDebut + 1}-07-31`;
  }

  private genererAnneesDisponibles(anneeCourante: number): string[] {
    return [
      this.construireLibelleAnnee(anneeCourante),
      this.construireLibelleAnnee(anneeCourante + 1),
      this.construireLibelleAnnee(anneeCourante + 2)
    ];
  }

  onAnneeChange(): void {

    const libelle = this.form.get('libelle')?.value;

    if (!libelle) {
      return;
    }

    const anneeDebut = Number(libelle.split('-')[0]);

    if (Number.isNaN(anneeDebut)) {
      return;
    }

    this.form.patchValue({
      dateDebut: this.construireDateDebut(anneeDebut),
      dateFin: this.construireDateFin(anneeDebut)
    });
  }

  get libelle() {
    return this.form.get('libelle');
  }

  get dateDebut() {
    return this.form.get('dateDebut');
  }

  get dateFin() {
    return this.form.get('dateFin');
  }

}