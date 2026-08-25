import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { SetupClasseItemRequest } from '../../../../core/models/setup/request/setup-classe-item-request.model';
import { SetupClasseRequest } from '../../../../core/models/setup/request/setup-classe-request.model';

export interface NiveauSelection {
  id?: number;
  libelle: string;
  selected: boolean;
}
export interface CycleSelection {
  id?: number;
  code?: string;
  libelle: string;
  niveaux: NiveauSelection[];
}
export interface StructurePedagogiqueSelection {
  cycles: CycleSelection[];
}
interface ClasseFormValue {
  libelle: string;
  niveauId: number | null;
  niveauLibelle: string;
  capacite: number | null;
  selected: boolean;
}
interface ClasseView {
  libelle: string;
  selected: boolean;
}
interface NiveauView {
  id: number;
  libelle: string;
  cycleLabel: string;
  classes: ClasseView[];
}

@Component({
  selector: 'app-classes-a-ajouter-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './classes-a-ajouter-component.html',
  styleUrl: './classes-a-ajouter-component.css',
})
export class ClassesAAjouterComponent implements OnChanges {

  @Input({ required: true })
  structurePedagogique!: StructurePedagogiqueSelection;

  @Output()
  formValidityChange = new EventEmitter<boolean>();

  @Output()
  classesChange = new EventEmitter<SetupClasseRequest>();

  form: FormGroup;

  private readonly CAPACITE_PAR_DEFAUT = 20;

  constructor(private readonly fb: FormBuilder) {

    this.form = this.fb.group({
      classes: this.fb.array([]),
    });

    this.classesFormArray.valueChanges.subscribe(() => {
      this.emitChanges();
    });
  }

  get classesFormArray(): FormArray {
    return this.form.get('classes') as FormArray;
  }

  get nombreClasses(): number {
    return this.classesFormArray.length;
  }

  get nombreClassesSelectionnees(): number {
    return this.classesFormArray.controls.filter(
      control =>
        control.get('selected')?.value === true
    ).length;
  }

  get selectedClassesCount(): number {
    return this.nombreClassesSelectionnees;
  }

  get hasSelection(): boolean {
    return this.nombreClassesSelectionnees > 0;
  }

  niveaux(): NiveauView[] {

    const niveaux: NiveauView[] = [];

    for (const cycle of this.structurePedagogique?.cycles ?? []) {

      for (const niveau of cycle.niveaux ?? []) {

        if (
          niveau.id == null ||
          !niveau.selected
        ) {
          continue;
        }

        const classes: ClasseView[] =
          this.classesFormArray.controls
            .filter(control =>
              control.get('niveauId')?.value === niveau.id
            )
            .map(control => ({
              libelle:
                control.get('libelle')?.value ?? '',
              selected:
                control.get('selected')?.value === true,
            }));

        niveaux.push({
          id: niveau.id,
          libelle: niveau.libelle,
          cycleLabel: cycle.libelle,
          classes,
        });
      }
    }

    return niveaux;
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['structurePedagogique'] &&
      this.structurePedagogique
    ) {
      this.construireClasses();
    }
  }

  private construireClassesV1(): void {

    this.classesFormArray.clear();

    if (!this.structurePedagogique?.cycles) {
      this.emitChanges();
      return;
    }

    for (const cycle of this.structurePedagogique.cycles) {

      for (const niveau of cycle.niveaux ?? []) {

        if (!niveau.selected) {
          continue;
        }

        if (niveau.id == null) {
          continue;
        }

        this.classesFormArray.push(
          this.creerClasseFormGroup(
            niveau,
            `${niveau.libelle} 1`
          )
        );

        this.classesFormArray.push(
          this.creerClasseFormGroup(
            niveau,
            `${niveau.libelle} 2`
          )
        );
      }
    }

    this.emitChanges();
  }

  private construireClasses(): void {

  this.classesFormArray.clear();

  if (!this.structurePedagogique?.cycles) {
    this.emitChanges();
    return;
  }

  const suffixes = ['A', 'B'];

  for (const cycle of this.structurePedagogique.cycles) {

    for (const niveau of cycle.niveaux ?? []) {

      if (!niveau.selected) {
        continue;
      }

      if (niveau.id == null) {
        continue;
      }

      for (const suffixe of suffixes) {

        this.classesFormArray.push(
          this.creerClasseFormGroup(
            niveau,
            `${niveau.libelle} ${suffixe}`
          )
        );

      }
    }
  }

  this.emitChanges();
}

  private creerClasseFormGroup(niveau: NiveauSelection, libelle: string): FormGroup {

    return this.fb.group({

      libelle: [
        libelle,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(150),
        ],
      ],

      niveauId: [
        niveau.id ?? null,
        [
          Validators.required,
        ],
      ],

      niveauLibelle: [
        niveau.libelle,
      ],

      capacite: [
        this.CAPACITE_PAR_DEFAUT,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(200),
        ],
      ],

      selected: [
        true,
      ],
    });
  }

  toggleClasse(niveauLibelle: string, classeLibelle: string): void {

    const control = this.classesFormArray.controls.find(
      control =>
        control.get('niveauLibelle')?.value === niveauLibelle &&
        control.get('libelle')?.value === classeLibelle
    );

    if (!control) {
      return;
    }

    const selectedControl =
      control.get('selected');

    if (!selectedControl) {
      return;
    }

    selectedControl.setValue(
      !selectedControl.value
    );
  }

  toggleNiveau(niveauLibelle: string): void {

    const controls = this.classesFormArray.controls.filter(
      control =>
        control.get('niveauLibelle')?.value === niveauLibelle
    );

    if (controls.length === 0) {
      return;
    }

    const allSelected = controls.every(
      control =>
        control.get('selected')?.value === true
    );

    controls.forEach(control => {

      control.get('selected')?.setValue(
        !allSelected,
        {
          emitEvent: false,
        }
      );

    });

    this.emitChanges();
  }

  isNiveauSelected(niveau: NiveauView): boolean {
    return niveau.classes.some(
      classe => classe.selected
    );
  }

  isNiveauFullySelected(niveau: NiveauView): boolean {
    return (
      niveau.classes.length > 0 &&
      niveau.classes.every(
        classe => classe.selected
      )
    );
  }

  selectionnerToutes(): void {
    this.classesFormArray.controls.forEach(
      control => {

        control.get('selected')?.setValue(
          true,
          {
            emitEvent: false,
          }
        );

      }
    );

    this.emitChanges();
  }

  deselectionnerToutes(): void {

    this.classesFormArray.controls.forEach(
      control => {

        control.get('selected')?.setValue(
          false,
          {
            emitEvent: false,
          }
        );

      }
    );

    this.emitChanges();
  }

  supprimerClasse(index: number): void {

    if (
      index < 0 ||
      index >= this.classesFormArray.length
    ) {
      return;
    }

    this.classesFormArray.removeAt(index);

    this.emitChanges();
  }

  ajouterClasse(): void {
    const niveaux = this.getNiveauxSelectionnes();

    if (niveaux.length === 0) {
      return;
    }

    const niveau = niveaux[0];

    if (niveau.id == null) {
      return;
    }

    const nombreClasses = this.classesFormArray.controls.filter(
      control =>
        control.get('niveauId')?.value === niveau.id
    ).length;

    this.classesFormArray.push(
      this.creerClasseFormGroup(
        niveau,
        `${niveau.libelle} ${nombreClasses + 1}`
      )
    );

    this.emitChanges();
  }

  private getNiveauxSelectionnes(): NiveauSelection[] {

    const niveaux: NiveauSelection[] = [];

    for (
      const cycle
      of this.structurePedagogique?.cycles ?? []
    ) {

      for (
        const niveau
        of cycle.niveaux ?? []
      ) {

        if (
          niveau.selected &&
          niveau.id != null
        ) {
          niveaux.push(niveau);
        }
      }
    }

    return niveaux;
  }

  getRequest(): SetupClasseRequest {

    const classes: SetupClasseItemRequest[] =
      this.classesFormArray.getRawValue()
        .filter(
          (classe: ClasseFormValue) =>
            classe.selected === true
        )
        .map(
          (classe: ClasseFormValue) => ({
            libelle:
              classe.libelle.trim(),

            niveauId:
              classe.niveauId as number,

            capacite:
              classe.capacite as number,
          })
        );

    return {
      classes,
    };
  }

  getClassesRequest(): SetupClasseRequest {
    return this.getRequest();
  }

  isValid(): boolean {

    if (
      this.classesFormArray.length === 0
    ) {
      return false;
    }

    if (
      this.nombreClassesSelectionnees === 0
    ) {
      return false;
    }

    return this.classesFormArray.controls
      .filter(
        control =>
          control.get('selected')?.value === true
      )
      .every(
        control =>
          control.valid
      );
  }

  private emitChanges(): void {

    const valid = this.isValid();

    this.formValidityChange.emit(valid);

    this.classesChange.emit(
      this.getRequest()
    );
  }

  validate(): boolean {

    this.classesFormArray.controls.forEach(
      control =>
        control.markAllAsTouched()
    );

    const valid = this.isValid();

    this.formValidityChange.emit(valid);

    if (valid) {
      this.classesChange.emit(
        this.getRequest()
      );
    }

    return valid;
  }
}