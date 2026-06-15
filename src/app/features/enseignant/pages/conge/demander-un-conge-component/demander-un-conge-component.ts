import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { CongesAddEdit } from '../../../../../core/models/planification/conge-add-edit';
import { Utilisateur } from '../../../../../core/models/utilisateur/utilisateur';
import { PlanificationResourceService } from '../../../../administration/planification/services/planification-resource.service';

@Component({
  selector: 'app-demander-un-conge-component',
  standalone: true,
  imports: [ReactiveFormsModule, NgxEditorModule],
  templateUrl: './demander-un-conge-component.html',
  styleUrl: './demander-un-conge-component.css',
})
export class DemanderUnCongeComponent implements OnInit, OnDestroy {

  errorMessage?: string;
  congeId?: number;
  conge: any;
  congeFormGroup!: FormGroup;
  editor!: Editor;
  isEdit: boolean = false;
  ecoleId: any;
  userId: number;
  utilisateur: Utilisateur = {};

  title = "Enregistrer une demande de congé";

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];


  private readonly planificationResouce = inject(PlanificationResourceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastrService);
  private readonly activeRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  constructor(
  ) {
    this.congeId = this.activeRoute.snapshot.params['id'];
    this.userId = Number(localStorage.getItem('id'));
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.initializeForm(null);
    if (this.congeId != null && this.congeId != undefined) {
      this.getCongeById(this.congeId);
      this.title = 'Modifier une demande de congè';
      this.isEdit = true;
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  getCongeById(congeId: number) {
    this.planificationResouce.getSingleResource('conges', congeId).subscribe({
      next: (data) => {
        this.conge = data;
       
        this.congeFormGroup.patchValue({
        id: this.conge?.id ?? '',
        objet: this.conge?.objet ?? '',
        description: this.conge?.description ?? '',
        dateDebut: this.conge?.dateDebut ?? '',
        dateFin: this.conge?.dateFin ?? ''
      });
      }
    });
  }

  initializeForm(conges: CongesAddEdit | null) {
    this.congeFormGroup = this._formBuilder.group({
      id: [conges?.id ?? ''],
      objet: [conges?.objet ?? '', Validators.required],
      description: [conges?.description ?? ''],
      dateDebut: [conges?.dateDebut ?? '', Validators.required],
      dateFin: [conges?.dateFin ?? '', Validators.required],
    });
  }

  ajouterEditUneDemandeConge() {
    const payload = this.congeFormGroup.value;
    payload.ecole = this.ecoleId;
    payload.userId = this.userId;
    if (!this.isEdit) {
      this.planificationResouce.createRessource('conges', payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La demande de congés a été enregistrées avec succès !!! ');
            this.goBack();
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la création : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la création : ' + data.error);
        }
      });

    } else {
      this.planificationResouce.updateResource('conges', Number(this.congeId), payload).subscribe({
        next: (data) => {
          if (data.statut === 'OK') {
            this.toastService.success('succès', 'La note d\'information a été modifiées avec succès !!! ');
            this.goBack();
          } else if (data.statut === 'FAILED') {
            this.toastService.error('error', 'Erreur lors de la mofication : ' + data.message);
          }
        },
        error: (data) => {
          console.log('error', 'Erreur lors de la création : ' + data.error);
          this.toastService.error('error', 'Erreur lors de la mofication : ' + data.error);
        }
      });

    }

  }

  goBack() {
    this.router.navigate(['enseignant/mes-conges'])
  }


}

