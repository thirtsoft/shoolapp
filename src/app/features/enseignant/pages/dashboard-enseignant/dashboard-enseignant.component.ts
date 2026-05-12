import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from '@iqx-limited/ngx-toastr';
import { DetailsEnseignantUtilisateur } from '../../../../core/models/enseignant/details-enseignant-utilisateur';
import { ParentDetails } from '../../../../core/models/parent/parent-details';
import { CommonService } from '../../../../core/services/common.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { PlanificationResourceService } from '../../../administration/planification/services/planification-resource.service';
import { EnseignantService } from '../../service/enseignant.service';

@Component({
  selector: 'app-dashboard-enseignant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-enseignant.component.html',
  styleUrls: ['./dashboard-enseignant.component.css']
})
export class DashboardEnseignantComponent implements OnInit {

  userId?: number;
  parentDetails: ParentDetails = {};
  list: any = []
  appointmentId: any;
  appointments: any = [];
  patients: any = [];
  patientsLength: any[] = [];
  appointmentsLength: any = [];
  TotalPatientsLength: any[] = [];
  activeTab = 'upcomming';
  enseignentDetails?: DetailsEnseignantUtilisateur = {};
  nombreEnseignement?: number;

  private readonly enseignantService = inject(EnseignantService);
  private readonly enseignementService = inject(PlanificationResourceService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly dossierEleveService = inject(CommonService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  constructor(

  ) {
    this.userId = this.localStorage.getItem('id');
    console.log('userid ', this.userId);
  }

  ngOnInit(): void {
    if (this.userId)
      this.getDetailsEnseignantUtilisateur(this.userId);
  }

  getDetailsEnseignantUtilisateur(userid: number) {
    this.enseignantService.getDetailsEnseignantUtilisateur(userid)
      .subscribe(res => {
        this.enseignentDetails = res;
        this.countEnseignementByEnseignant(this.enseignentDetails.id!)
      })
  }

  countEnseignementByEnseignant(enseignantId: number) {
    this.enseignementService.countEnseignementByEnseignant(enseignantId)
      .subscribe(res => {
        this.nombreEnseignement = res;
      })
  }


}
