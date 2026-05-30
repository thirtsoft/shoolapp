import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
import { Utilisateur } from '../../../../core/models/utilisateur/utilisateur';
import { CommonService } from '../../../../core/services/common.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { UtilisateurService } from '../../../administration/utilisateur/service/utilisateur.service';
import { ParentService } from '../../service/parent.service';
import { ListFactureImpayeesEleveComponent } from '../facture/list-facture-impayees-eleve/list-facture-impayees-eleve.component';
import { CoursSemaineEleveComponent } from '../semaine/cours-semaine-eleve/cours-semaine-eleve.component';
import { ExerciceSemaineEleveComponent } from '../semaine/exercice-semaine-eleve/exercice-semaine-eleve.component';
import { NoteSemaineEleveComponent } from '../semaine/note-semaine-eleve/note-semaine-eleve.component';

@Component({
  selector: 'app-dashboard-parent',
  standalone: true,
  imports: [ReactiveFormsModule, NoteSemaineEleveComponent, ExerciceSemaineEleveComponent, CoursSemaineEleveComponent,
    ListFactureImpayeesEleveComponent
  ],
  templateUrl: './dashboard-parent.component.html',
  styleUrls: ['./dashboard-parent.component.css']
})
export class DashboardParentComponent implements OnInit {

  userId?: number;
  parentDetails: ParentDetails = {};
  list: any = []
  appointmentId: any;
  appointments: any = [];
  patients: any = [];
  patientsLength: any;
  appointmentsLength: any;
  TotalPatientsLength: any;
  activeTab = 'upcomming';
  eleveId?: number;
  utilisateur: Utilisateur = {};
  classeId?: number;


  private readonly parentService = inject(ParentService);
  private readonly userService = inject(UtilisateurService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly commonService = inject(CommonService);
  private readonly route = inject(ActivatedRoute);

  constructor(
  ) {
    this.userId = this.localStorage.getItem('id');
    this.eleveId = this.localStorage.getItem('eleveId');
    this.classeId = this.localStorage.getItem('classeId');

  }

  ngOnInit(): void {
    this.getConnectedUserInfos();
    if (this.userId)
      this.getDetailsParent(this.userId);
  }

  getConnectedUserInfos() {
    const userId = localStorage.getItem('id');
    this.userService.getUtilisateur(Number(userId)).subscribe({
      next: data => {
        this.utilisateur = data;
        console.log('connected users ', this.utilisateur);
      },
      error: error => { console.log(error) },
    });
  }

  getDetailsParent(parentId: number) {
    this.parentService.getDetailsParent(parentId)
      .subscribe(res => {
        this.parentDetails = res;
        console.log('parent', this.parentDetails);
      })
  }


}
