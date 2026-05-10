import { Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eleve, MedecinTraitant, Parent } from '../../../../../core/models/parent/parent';
import { EleveRequest } from '../../../../../core/models/dossiereleve/request/eleve-request';
import { Inscription } from '../../../../../core/models/dossiereleve/request/inscription';
import { Classe } from '../../../../../core/models/referentiels/classe';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DossierEleveService } from '../../service/dossier-eleve.service';
import { DossierResourceService } from '../../service/dossier-resource.service';
import { ToastrService } from '@iqx-limited/ngx-toastr';


@Component({
  selector: 'app-inscrire-eleve',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './inscrire-eleve.component.html',
  styleUrls: ['./inscrire-eleve.component.css']
})
export class InscrireEleveComponent implements OnInit {

  eleveFormGroup!: FormGroup;
  errorMessage?: string;
  eleve?: Eleve;
  requestEleve: EleveRequest = {};
  eleveId?: number;
  typeSexe?: string[] = ["Masculin", "Féminin"];
  civilites?: string[] = ["M.", "Me"];
  today = new Date();
  title = "Création d'un élève";
  code?: number;

  medecinTraitantFormGroup!: FormGroup;
  medecinTraitant?: MedecinTraitant;
  medecinTraitantId?: number;

  //  parentFormGroup!: FormGroup;
  parent: Parent = {};
  parentId?: number;

  inscriptionFormGroup!: FormGroup;
  inscription?: Inscription;
  inscriptionId?: number;

  paramId: any = 0;
  userId?: number;
  classes: Classe[] = [];
  anneeScolaires: AnneeScolaire[] = [];
  currentStep: number = 0;
  endStep: boolean = false;
  allergie?: string;
  allergies?: string[];
  telephonesList?: string[];

  newParent: boolean = true;
  selectedOption: boolean = true;
  utilisateurDTOResult: any;

  private readonly router = inject(Router);
  private readonly dossierEleveService = inject(DossierEleveService);
  private readonly dossierResource = inject(DossierResourceService);

  /*
  private readonly referentielService = inject(ReferentielService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly localStorage = inject(LocalStorageService);
*/
   private readonly _formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastrService);
    private readonly location = inject(Location);

  parentFormGroup = this._formBuilder.group({
    nouveauParent: [true],
    utilisateurDTOS: this._formBuilder.array([this.newParentItem()]),
    utilisateurDTOs: this._formBuilder.array([this.ParentItemIdentifiant()])
  });

  currentFile?: File;
  message = '';
  preview = '';

  ngOnInit(): void {
  //  this.userId = this.localStorage.getItem('id');
    this.formateJS();
    this.initializeEleveForm(null);
    this.initializeMedecinTraitantForm(null);
    this.initializeInscriptionForm(null);
  //  this.getClasses();
  //  this.getAnneeScolaires();
    this.parentFormGroup.get('nouveauParent')?.valueChanges.subscribe((value:any) => {
      console.log('Valeur sélectionnée:', value);
      this.newParent = value;
    });
  }

  /*
  getClasses() {
    this.referentielService.getAllClasses().subscribe(
      (data: any[]) => {
        this.classes = data;
      },
      (error:any) => (this.errorMessage = <any>error)
    );
  }

  getAnneeScolaires() {
    this.referentielResource.getResourceList('anneescolaire').subscribe({
      next: (data:any) => {
        this.anneeScolaires = data;
      }
    });
  }*/

  initializeEleveForm(eleve: Eleve | null) {
    this.eleveFormGroup = this._formBuilder.group({
      id: [eleve?.id ? eleve.id : ''],
      prenom: [eleve?.prenom ? eleve.prenom : '', Validators.required],
      nom: [eleve?.nom ? eleve.nom : '', Validators.required],
      sexe: [eleve?.sexe ? eleve.sexe : '', Validators.required],
      lieuNaissance: [eleve?.lieuNaissance ? eleve.lieuNaissance : '', Validators.required],
      address: [eleve?.address ? eleve.address : ''],
      dateNaissance: [new Date(eleve?.dateNaissance!)],
      nationalite: [eleve?.nationalite ? eleve.nationalite : '']
    });
  }

  ajouterEleve() {
    const circles = document.querySelectorAll(".circle");
    const progressBar: any = document.querySelector(".indicator");
    const payload = this.eleveFormGroup.value;
    if (payload) {
      this.currentStep = this.currentStep + 1;
      progressBar.style.width = `${((this.currentStep - 1) / (circles.length - 1)) * 100}%`;
    }
  }

  utilisateurDTOS(): FormArray {
    return this.parentFormGroup.get('utilisateurDTOS') as FormArray;
  }

  newParentItem(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
      civility: ['', Validators.required],
      address: ['', Validators.required],
      username: ['', Validators.required],
      profession: [''],
      email: [''],
    })
  }

  onAddParentItem() {
    if (this.utilisateurDTOS().length === 0) {
      this.utilisateurDTOS().push(this.newParentItem());
    }
  }

  removeParentItem(parentItemIndex: number) {
    this.utilisateurDTOS().removeAt(parentItemIndex);
  }

  utilisateurDTOs(): FormArray {
    return this.parentFormGroup.get('utilisateurDTOs') as FormArray;
  }


  ParentItemIdentifiant(): FormGroup {
    return this._formBuilder.group({
      telephone: ['', Validators.required],
      email: ['']
    })
  }

  onAddParentIdentifiantItem() {
    if (this.utilisateurDTOs().length === 0) {
      this.utilisateurDTOs().push(this.ParentItemIdentifiant());
    }
  }

  onNouveauParentChange(value: boolean) {
    this.newParent = value;
    if (value) {
      this.utilisateurDTOs().clear();
      if (this.utilisateurDTOS().length === 0) {
        this.onAddParentItem();
      }
    } else {
      this.utilisateurDTOS().clear();
      if (this.utilisateurDTOs().length === 0) {
        this.onAddParentIdentifiantItem();
      }
    }
  }

  get isFormValid(): boolean {
    if (this.parentFormGroup.get('nouveauParent')?.value === null) {
      return false;
    }

    if (this.parentFormGroup.get('nouveauParent')?.value) {
      return this.utilisateurDTOS().length > 0 &&
        this.utilisateurDTOS().controls.every(item => item.valid);
    } else {
      return this.utilisateurDTOs().length > 0 &&
        this.utilisateurDTOs().controls.every(item => item.valid);
    }
  }


  ajouterParent() {
    const circles = document.querySelectorAll(".circle");
    const progressBar: any = document.querySelector(".indicator");
    const payload = this.parentFormGroup.value;
    this.telephonesList = [];
    if (payload) {
      this.currentStep = this.currentStep + 1;
      progressBar.style.width = `${((this.currentStep - 1) / (circles.length - 1)) * 100}%`;

      if (payload?.utilisateurDTOs) {
        this.telephonesList = payload.utilisateurDTOs
          .map((item: any) => item.telephone)
          .filter((telephone: string) => telephone !== undefined);
      }
    }
    console.log('matricules list parent', this.telephonesList);
  }

  initializeMedecinTraitantForm(medecin: MedecinTraitant | null) {
    this.medecinTraitantFormGroup = this._formBuilder.group({
      id: [medecin?.id ? medecin.id : ''],
      prenom: [medecin?.prenom ? medecin.prenom : '', Validators.required],
      nom: [medecin?.nom ? medecin.nom : '', Validators.required],
      telephone: [medecin?.telephone ? medecin.telephone : ''],
      email: [medecin?.email ? medecin.email : ''],
    });
  }

  add(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.allergie === '') return
    if (!this.allergies)
      this.allergies = [];
    this.allergies.push(this.allergie!.trim());
    this.allergie = '';
  }

  remove(produit: string): void {
    const index = this.allergies!.indexOf(produit);
    if (index >= 0) {
      this.allergies!.splice(index, 1);
    }
  }

  selectFile(event: any): void {
    this.message = '';
    this.preview = '';
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.item(0)) {
      const file: File = selectedFiles.item(0);

      if (!file.type.match('image.*')) {
        this.message = 'Seules les images sont autorisées!';
        return;
      }

      if (file.size > 2097152) { // 2MB en octets
        this.message = 'L\'image ne doit pas dépasser 2MB!';
        return;
      }

      this.currentFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = e.target.result;
      };
      reader.readAsDataURL(this.currentFile);
    }
    console.log("Le fichier choisi est ", this.currentFile);
  }


  saveEleve() {
    if (this.utilisateurDTOS().length > 0) {
      this.newParent = false;
      this.utilisateurDTOResult = this.parentFormGroup.getRawValue().utilisateurDTOS;
    } else {
      this.newParent = true;
      this.utilisateurDTOResult = this.parentFormGroup.getRawValue().utilisateurDTOs;
    }
    let request: Eleve = {
      id: this.eleveFormGroup.getRawValue().id,
      nom: this.eleveFormGroup.getRawValue().nom,
      prenom: this.eleveFormGroup.getRawValue().prenom,
      sexe: this.eleveFormGroup.getRawValue().sexe,
      lieuNaissance: this.eleveFormGroup.getRawValue().lieuNaissance,
      dateNaissance: this.eleveFormGroup.getRawValue().dateNaissance,
      nationalite: this.eleveFormGroup.getRawValue().nationalite,
      address: this.eleveFormGroup.getRawValue().address,
      allergies: this.allergies,
      utilisateurDTOS: this.utilisateurDTOResult,
      medecinTraitantDTO: this.medecinTraitantFormGroup.getRawValue()
    }
    const circles = document.querySelectorAll(".circle");
    const progressBar: any = document.querySelector(".indicator");
    request.parentExist = this.newParent;
    request.telephones = this.telephonesList;
    this.dossierEleveService.enregistrerEleve(request).subscribe({
      next: (response) => {
        if (response.statut === 'OK') {
          this.code = response.eleve;
          this.eleveId = response.eleve;
          this.currentStep = this.currentStep + 1;
          progressBar.style.width = `${((this.currentStep - 1) / (circles.length - 1)) * 100}%`;
          this.toastService.success('succès', 'Les informations l\'élève ont été enregistrées avec succès !!! ');
        } else if (response.statut === 'FAILED') {
          this.toastService.error('Erreur', response.message);
        } else {
          this.toastService.error('Erreur', 'Réponse inattendue du serveur: ' + JSON.stringify(response));
        }
      }, error: (error) => {
        console.error('Erreur technique:', error);
        const errorMsg = error.error?.message || error.message || 'Erreur de connexion au serveur';
        this.toastService.error('Erreur technique', errorMsg);
      }
    });
  }

  saveEleveWithFiles() {
    const formData: FormData = new FormData();

    if (this.utilisateurDTOS().length > 0) {
      this.newParent = false;
      this.utilisateurDTOResult = this.parentFormGroup.getRawValue().utilisateurDTOS;
    } else {
      this.newParent = true;
      this.utilisateurDTOResult = this.parentFormGroup.getRawValue().utilisateurDTOs;
    }
    let request: Eleve = {
      id: this.eleveFormGroup.getRawValue().id,
      nom: this.eleveFormGroup.getRawValue().nom,
      prenom: this.eleveFormGroup.getRawValue().prenom,
      sexe: this.eleveFormGroup.getRawValue().sexe,
      lieuNaissance: this.eleveFormGroup.getRawValue().lieuNaissance,
      dateNaissance: this.eleveFormGroup.getRawValue().dateNaissance,
      nationalite: this.eleveFormGroup.getRawValue().nationalite,
      address: this.eleveFormGroup.getRawValue().address,
      allergies: this.allergies,
      utilisateurDTOS: this.utilisateurDTOResult,
      medecinTraitantDTO: this.medecinTraitantFormGroup.getRawValue()
    }
    const circles = document.querySelectorAll(".circle");
    const progressBar: any = document.querySelector(".indicator");
    request.parentExist = this.newParent;
    request.telephones = this.telephonesList;
    formData.append('file', this.currentFile!);
    formData.append('piecejointeeleve', JSON.stringify(request));
    this.dossierEleveService.enregistrerEleveWithFiles(formData).subscribe({
      next: (response) => {
        if (response.statut === 'OK') {
          this.code = response.eleve;
          this.eleveId = response.eleve;
          this.currentStep = this.currentStep + 1;
          progressBar.style.width = `${((this.currentStep - 1) / (circles.length - 1)) * 100}%`;
          this.toastService.success('succès', 'Les informations l\'élève ont été enregistrées avec succès !!! ');
        } else if (response.statut === 'FAILED') {
          this.toastService.error('Erreur', response.message);
        } else {
          this.toastService.error('Erreur', 'Réponse inattendue du serveur: ' + JSON.stringify(response));
        }
      }, error: (error) => {
        console.error('Erreur technique:', error);
        const errorMsg = error.error?.message || error.message || 'Erreur de connexion au serveur';
        this.toastService.error('Erreur technique', errorMsg);
      }
    });
  }


  initializeInscriptionForm(inscription: Inscription | null) {
    this.inscriptionFormGroup = this._formBuilder.group({
      id: [inscription?.id ? inscription.id : ''],
      eleveId: [inscription?.eleveDTO?.id ? inscription?.eleveDTO?.id : '', Validators.required],
      anneeScolaireId: [inscription?.anneeScolaireDTO?.id ? inscription?.anneeScolaireDTO?.id : '', Validators.required],
      classeId: [inscription?.classeDTO?.id ? inscription?.classeDTO?.id : '', Validators.required],
      montantInscription: [inscription?.montantInscription ? inscription.montantInscription : '', Validators.required],
    });
  }

  getInscriptionByCodeEleve(code: string) {
    this.dossierEleveService.getInscriptionByCodeEleve(code).subscribe({
      next: (data) => {
        this.inscription = data;
        this.inscriptionId = this.inscription.id;
        this.initializeInscriptionForm(this.inscription);
      }
    });
  }

  ajouterInscription() {
    const payload: Inscription = {
      id: this.inscriptionFormGroup.get("id")!.value,
      anneeScolaireId: this.inscriptionFormGroup.get("anneeScolaireId")!.value,
      classeId: this.inscriptionFormGroup.get("classeId")!.value,
      montantInscription: this.inscriptionFormGroup.get("montantInscription")!.value,
      eleveId: this.eleveId
    }
    this.dossierEleveService.saveInscription(payload).subscribe({
      next: (data) => {
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Les informations inscription ont été enregistrées avec succès !!! ');
          this.router.navigate(['/admin/dossier-eleve/eleves'])
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
    this.location.back();
  }

  cancel() {
    this.location.back()
  }

  precedent() {
    const circles = document.querySelectorAll(".circle");
    const progressBar: any = document.querySelector(".indicator");
    const payload = this.parentFormGroup.value;
    if (payload) {
      this.currentStep = this.currentStep - 1;
      progressBar.style.width = `${((this.currentStep - 1) / (circles.length - 1)) * 100}%`;
    }
  }



  public formateJS() {
    const circles = document.querySelectorAll(".circle");
    const progressBar: any = document.querySelector(".indicator");
    const buttons = document.querySelectorAll("button");
    console.log(circles.length);
    this.currentStep = 1;
    const updateSteps = (e:any) => {
      this.currentStep = e.target.id === "next" ? ++this.currentStep : --this.currentStep;
      circles.forEach((circle, index) => {
        circle.classList[`${index < this.currentStep ? "add" : "remove"}`]("active");
      });
      progressBar.style.width = `${((this.currentStep - 1) / (circles.length - 1)) * 100}%`;
      if (this.currentStep === circles.length) {
        this.endStep = true;
        console.log(buttons[1]);
      } else if (this.currentStep === 1) {
        buttons[0].disabled = true;
        this.endStep = false;
      } else {
        buttons.forEach((button) => (button.disabled = false));
      }
    };
    buttons.forEach((button) => {
      button.addEventListener("click", updateSteps);
    });
  }

  private getValue(event: any) {
    if (event instanceof Event) return +(event.target as HTMLSelectElement).value;
    else return +event;
  }

  private getStringValue(event: any) {
    if (event instanceof Event) return (event.target as HTMLSelectElement).value;
    else return event;
  }

}
