import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InscriptionEleveTypeService } from '../../../../../core/models/comptabilite/inscrire-eleve-service';
import { ListeInscription } from '../../../../../core/models/dossiereleve/request/liste-inscription';
import { AnneeScolaire } from '../../../../../core/models/referentiels/annee-scolaire';
import { TypeServiceOffert } from '../../../../../core/models/referentiels/type-service-offert';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { DossierResourceService } from '../../../../administration/dossier-eleve/service/dossier-resource.service';
import { ReferentielResourceService } from '../../../../administration/referentiel/service/referentiel-resource.service';
import { UtilisateurService } from '../../../../administration/utilisateur/service/utilisateur.service';
import { ComptabiliteResourceService } from '../../../services/comptabilite-resource.service';

@Component({
  selector: 'app-inscrire-eleve-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inscrire-eleve-service.component.html',
  styleUrls: ['./inscrire-eleve-service.component.css']
})
export class InscrireEleveServiceComponent implements OnInit, AfterViewInit {
  errorMessage?: string;
  eleveinscrireId: number;
  eleveinscrireFormGroup!: FormGroup;
  eleveinscrire: any;
  isEdit: boolean = false;

  typeServiceList: TypeServiceOffert[] = [];
  selectedTypeServiceOfferts: number[] = [];
  serviceDropdownOpen: boolean = false;

  eleveList?: ListeInscription[];
  anneeScolaires: AnneeScolaire[] = [];
  classList?: any[];
  selectedPrimary: number | null = null;
  selectedSecondary: number | null = null;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Inscrire un élève à un service";

  @ViewChild('serviceSelectContainer') serviceSelectContainer!: ElementRef;

  private readonly comptabiliteResource = inject(ComptabiliteResourceService);
  private readonly referentielResource = inject(ReferentielResourceService);
  private readonly eleveService = inject(DossierResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor() {
    this.eleveinscrireId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
    this.ecoleId = Number(localStorage.getItem('ecoleId'));
  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    this.getClassList();
    this.getTypeServiceList();
    this.getAnneeScolaires();
    this.initializeForm(null);
    if (this.eleveinscrireId != null && this.eleveinscrireId != undefined) {
      this.getInscriptionEleve(this.eleveinscrireId);
      this.title = 'Modifier une inscription';
      this.isEdit = true;
    }
  }

  ngAfterViewInit() {
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.serviceDropdownOpen && this.serviceSelectContainer) {
      const clickedInside = this.serviceSelectContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.serviceDropdownOpen = false;
      }
    }
  }

  onDropdownClick(event: MouseEvent) {
    event.stopPropagation();
  }

  getConnectedUserInfos() {
    this.utilisateurService.getUtilisateur(this.userId).subscribe({
      next: data => {
        this.utilisateur = data;
      },
      error: error => { console.log(error) },
    });
  }

  getTypeServiceList() {
    this.referentielResource.getResourceList('typeserviceoffert/autres').subscribe({
      next: (data: any) => {
        this.typeServiceList = data;
      }
    });
  }

  getSelectedServicesLabels(): string {
    if (!this.selectedTypeServiceOfferts || this.selectedTypeServiceOfferts.length === 0) {
      return '';
    }

    const selectedServices = this.typeServiceList
      .filter(service => this.selectedTypeServiceOfferts.includes(service.id!))
      .map(service => service.libelle);

    return selectedServices.join(', ');
  }

  getNormalServices(): TypeServiceOffert[] {
    return this.typeServiceList;
  }

  getClassList() {
    this.referentielResource.getResourceList('classe').subscribe({
      next: (data) => {
        this.classList = data;
      }
    });
  }

  getAnneeScolaires() {
    this.referentielResource.getResourceList('anneescolaire').subscribe({
      next: (data: any) => {
        this.anneeScolaires = data;
      }
    });
  }

  onPrimaryChange(event: any) {
    const classId = event.target.value;
    if (classId) {
      this.getEleveList(classId);
    }
  }

  getEleveList(classId: number) {
    this.eleveService.getResourceListByElement('inscription/classe', classId).subscribe({
      next: (data: any) => {
        this.eleveList = data;
      }
    });
  }

  getInscriptionEleve(eleveserviceId: number) {
    this.comptabiliteResource.recupererUneResource('eleveservice', eleveserviceId).subscribe({
      next: (data) => {
        this.eleveinscrire = data;
        this.getEleveList(this.eleveinscrire.classId);
        this.initializeForm(this.eleveinscrire);
      }
    });
  }

  toggleServiceDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.serviceDropdownOpen = !this.serviceDropdownOpen;
  }

  toggleSelection(id: number, event: Event) {
    event.stopPropagation();
    const index = this.selectedTypeServiceOfferts.indexOf(id);
    if (index === -1) {
      this.selectedTypeServiceOfferts.push(id);
    } else {
      this.selectedTypeServiceOfferts.splice(index, 1);
    }
    this.eleveinscrireFormGroup.get('typeServiceOffertDTOList')?.setValue(this.selectedTypeServiceOfferts);
  }

  isAllSelected(): boolean {
    return this.typeServiceList.length > 0 &&
      this.typeServiceList.every((a) => this.selectedTypeServiceOfferts.includes(a.id!));
  }

  toggleSelectAll(event: Event) {
    event.stopPropagation();
    if (this.isAllSelected()) {
      this.selectedTypeServiceOfferts = [];
    } else {
      this.selectedTypeServiceOfferts = this.typeServiceList
        .map((a) => a.id)
        .filter((id): id is number => id !== undefined);
    }
    this.eleveinscrireFormGroup.get('typeServiceOffertDTOList')?.setValue(this.selectedTypeServiceOfferts);
  }

  getSelectedEleveName(): string {
    const eleveId = this.eleveinscrireFormGroup.get('eleve')?.value;
    const eleve = this.eleveList?.find(e => e.eleve === eleveId);
    return eleve ? `${eleve.prenomEleve} ${eleve.nomEleve}` : '';
  }

  isFormStep2Valid(): boolean {
    return !!(this.eleveinscrireFormGroup.get('classId')?.value &&
      this.eleveinscrireFormGroup.get('eleve')?.value &&
      this.eleveinscrireFormGroup.get('anneeScolaire')?.value);
  }

  initializeForm(eleveservice: InscriptionEleveTypeService | null) {
    const serviceIds = eleveservice?.typeServiceOffertDTOList?.map(a => a.id).filter(id => id !== undefined) ?? [];

    this.eleveinscrireFormGroup = this._formBuilder.group({
      id: [eleveservice?.id ? eleveservice.id : ''],
      classId: [eleveservice?.classId ? eleveservice.classId : '', Validators.required],
      anneeScolaire: [eleveservice?.anneeScolaire ? eleveservice.anneeScolaire : '', Validators.required],
      eleve: [eleveservice?.eleve ? eleveservice.eleve : '', Validators.required],
      typeServiceOffertDTOList: [serviceIds, Validators.required],
      benefice_remise: [eleveservice?.benefice_remise ?? '0', Validators.required],
      remise: [eleveservice?.remise ?? ''],
      motif: ['', Validators.required],
    });

    this.selectedTypeServiceOfferts = serviceIds;
  }

  ajouteditInscriptionEleveTypeService() {
    if (this.selectedTypeServiceOfferts.length === 0) {
      this.toastService.warning('Attention', 'Veuillez sélectionner au moins un service');
      return;
    }

    const typeServiceOffertSelected = this.eleveinscrireFormGroup.value.typeServiceOffertDTOList;
    const payload = {
      id: this.eleveinscrireFormGroup.get('id')?.value,
      classId: this.eleveinscrireFormGroup.get('classId')?.value,
      eleve: this.eleveinscrireFormGroup.get('eleve')?.value,
      anneeScolaire: this.eleveinscrireFormGroup.get('anneeScolaire')?.value,
      benefice_remise: this.eleveinscrireFormGroup.get('benefice_remise')?.value,
      remise: this.eleveinscrireFormGroup.get('remise')?.value,
      motif: this.eleveinscrireFormGroup.get('motif')?.value,
      typeServiceOffertDTOList: this.typeServiceList.filter((action: any) => typeServiceOffertSelected.includes(Number(action.id))),
      ecole: this.ecoleId
    };

    if (!this.isEdit) {
      this.comptabiliteResource.creerUneRessource('eleveservice', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('Succès', 'L\'inscription a été enregistrée avec succès !');
            this.router.navigate(['admin/comptabilite/service']);
          } else if (data.statut === 'FAILED') {
            this.toastService.error('Erreur', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          this.toastService.error('Erreur', 'Erreur lors de la création : ' + data.error);
        }
      });
    } else {
      this.comptabiliteResource.modifierUneRessource('eleveservice', this.eleveinscrireId, payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('Succès', 'L\'inscription a été modifiée avec succès !');
            this.router.navigate(['admin/comptabilite/service']);
          } else if (data.statut === 'FAILED') {
            this.toastService.error('Erreur', 'Erreur lors de la modification : ' + data.message);
          }
        },
        error: (data) => {
          this.toastService.error('Erreur', 'Erreur lors de la modification : ' + data.error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['admin/comptabilite/service']);
  }

}
