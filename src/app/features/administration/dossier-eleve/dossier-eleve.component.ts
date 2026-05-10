import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dossier-eleve',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './dossier-eleve.component.html',
  styleUrls: ['./dossier-eleve.component.css']
})
export class DossierEleveComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
