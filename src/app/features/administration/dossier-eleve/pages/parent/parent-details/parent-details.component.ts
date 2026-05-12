import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParentDetails } from '../../../../../../core/models/parent/parent-details';
import { ParentService } from '../../../service/parent.service';

@Component({
  selector: 'app-parent-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './parent-details.component.html',
  styleUrls: ['./parent-details.component.css']
})
export class ParentDetailsComponent implements OnInit {

  errorMessage?: string;
  parentDetails?: ParentDetails;
  parentId?: number;
  today = new Date();
  userId?: number;

  title = "Ajouter un eleve";

  id: any; name: any;

  private readonly parentService = inject(ParentService);
  private readonly activatedRouter = inject(ActivatedRoute);


  ngOnInit(): void {
    this.parentId = this.activatedRouter.snapshot.params['id'];
    if (this.parentId) {
      this.getDetailsParent(this.parentId);
    }
  }

  getDetailsParent(parentId: number) {
    this.parentService.getDetailsParent(parentId)
      .subscribe(res => {
        this.parentDetails = res;
        console.log(this.parentDetails);
      },
        error => this.errorMessage = <any>error);
  }

}
