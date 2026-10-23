import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-chaier-texte',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './cahier-texte.component.html',
  styleUrls: ['./cahier-texte.component.css']
})
export class CahierTexteComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
