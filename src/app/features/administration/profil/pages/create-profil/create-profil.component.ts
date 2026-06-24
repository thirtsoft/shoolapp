import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Action } from '../../../../../core/models/profil/action';
import { Profil } from '../../../../../core/models/profil/profil';
import { TypeCompte } from '../../../../../core/models/profil/typecompte';
import { ProfilageService } from '../../service/profilage.service';

@Component({
  selector: 'app-create-profil',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-profil.component.html',
  styleUrls: ['./create-profil.component.css']
})
export class CreateProfilComponent implements OnInit {

  profilFormGroup!: FormGroup;
  errorMessage?: string;
  profil?: Profil = {};
  profilId: number;

  actionList: (Action | 'selectAll')[] = [];
  selectedActions: number[] = [];
  //typeCompeList: string[] = ['ECOLE', 'ENSEIGNANT', 'PARENT'];
  typeCompeList: TypeCompte[] = [];
  actionsDropdownOpen: boolean = false;
  @ViewChild('actionsSelectContainer') actionsSelectContainer!: ElementRef;
  today = new Date();

  title = "Création d'un profile";

  private readonly profilageService = inject(ProfilageService);
  private readonly toastService = inject(ToastrService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor(
  ) {
    this.profilId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.getTypeComptes();
    this.initializeForm(null);
    if (this.profilId && this.profilId != null) {
      this.getProfileById(this.profilId);
    }
  }

  getTypeComptes() {
    this.profilageService.getLesTypeComptes().subscribe({
      next: (data) => {
        this.typeCompeList = data;
      }
    });
  }

  toggleActionsDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.actionsDropdownOpen = !this.actionsDropdownOpen;
  }

  closeActionsDropdown() {
    this.actionsDropdownOpen = false;
  }

  // Fermer le dropdown quand on clique en dehors
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.actionsDropdownOpen && this.actionsSelectContainer) {
      const clickedInside = this.actionsSelectContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.actionsDropdownOpen = false;
      }
    }
  }

  toggleSelection(id: number, event: Event) {
    event.stopPropagation();
    const index = this.selectedActions.indexOf(id);
    if (index === -1) {
      this.selectedActions.push(id);
    } else {
      this.selectedActions.splice(index, 1);
    }
    this.profilFormGroup.get('actionDTOs')?.setValue(this.selectedActions);
    // Ne pas fermer le dropdown pour permettre sélections multiples
  }

  /*
  toggleSelectAll(event: Event) {
    event.stopPropagation();
    const normalActions = this.getNormalActions();
    if (this.isAllSelected()) {
      this.selectedActions = [];
    } else {
      this.selectedActions = normalActions.map((a) => a.id!) as number[];
    }
    this.profilFormGroup.get('actionDTOs')?.setValue(this.selectedActions);
  }*/

  getNormalActions(): Action[] {
    return this.actionList.filter(
      (item): item is Action => item !== 'selectAll'
    );
  }


  onTypeCompteChange(event: any) {
    console.log('typecompte', event.target.value);
    if (event.target.value != null && event.target.value != undefined) {
      this.getActionByTypeCompte(event.target.value);
    }
  }

  getActionByTypeCompte(typeCompte: number) {
    this.profilageService.getAllActionsByTypeCompte(typeCompte).subscribe(
      (data: any[]) => {
        //   this.listActions = data;
        this.actionList = ['selectAll', ...data];
      },
      (error) => (this.errorMessage = <any>error)
    );
  }

  /*
  toggleSelection(id: number, event: Event) {
    event.stopPropagation();
    const index = this.selectedActions.indexOf(id);
    if (index === -1) this.selectedActions.push(id);
    else this.selectedActions.splice(index, 1);
    this.profilFormGroup.get('actionDTOs')?.setValue(this.selectedActions);
  }*/

  isAllSelected(): boolean {
    const normalActions = this.actionList.filter(
      (a): a is Action => a !== 'selectAll'
    );
    return (
      normalActions.length > 0 &&
      normalActions.every((a) => this.selectedActions.includes(a.id!))
    );
  }

  toggleSelectAll(event: Event) {
    event.stopPropagation();
    const normalActions = this.actionList.filter(
      (a): a is Action => a !== 'selectAll'
    );
    if (this.isAllSelected()) {
      this.selectedActions = [];
    } else {
      this.selectedActions = normalActions.map((a) => a.id!) as number[];
    }
    this.profilFormGroup.get('actionDTOs')?.setValue(this.selectedActions);
  }

  initializeForm(profil: Profil | null) {
    this.profilFormGroup = this._formBuilder.group({
      id: [profil?.id ?? ''],
      libelle: [profil?.libelle ?? '', Validators.required],
      typeCompteId: [profil?.typeCompteId ?? '', Validators.required],
      actionDTOs: [profil?.actionDTOs?.map(a => a.id) ?? [], Validators.required],
    });
  }


  getProfileById(eleveId: number) {
    this.profilageService.getProfil(eleveId).subscribe({
      next: (data) => {
        this.profil = data;
        this.initializeForm(this.profil!);
        this.title = 'Modification d\'un profile';
      }
    });
  }

  ajouteditProfile() {
    const typeActionSelected = this.profilFormGroup.value.actionDTOs;
    this.profil = {
      id: this.profil?.id,
      libelle: this.profilFormGroup.get('libelle')?.value,
      actionDTOs: this.actionList
        .filter((action): action is Action => action !== 'selectAll')
        .filter(action => typeActionSelected.includes(Number(action.id))),

      typeCompteId: this.profilFormGroup.get('typeCompteId')?.value


    };
    this.profilageService.createProfil(this.profil).subscribe({
      next: (data) => {
        console.log('payload after : ', data);
        if (data.statut === 'OK') {
          this.toastService.success('succès', 'Le profile ont été enregistré avec succès !!! ');
          this.goBack();
        } else if (data.statut === 'FAILED') {
          this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
        }
        this.ngOnInit();
      },
      error: (data) => {
        console.log('error', 'Erreur lors de la création : ' + data.error);
        this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/profils']);
  }


}
