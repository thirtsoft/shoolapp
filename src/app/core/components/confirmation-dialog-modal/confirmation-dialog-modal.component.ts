import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog-modal',
  templateUrl: './confirmation-dialog-modal.component.html',
  styleUrls: ['./confirmation-dialog-modal.component.css']
})
export class ConfirmationDialogModalComponent implements OnInit {

  @Input() title: string = '';
  @Input() message: string = '';
  @Input() btnOkText: string = '';
  @Input() btnCancelText: string = '';

  private readonly activeModal = inject(NgbActiveModal);

  ngOnInit() {}

  public annuler() {
    this.activeModal.close(false);
  }

  public valider() {
    this.activeModal.close(true);
  }

  public fermer() {
    this.activeModal.dismiss();
  }
}
