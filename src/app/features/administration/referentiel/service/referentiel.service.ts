import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DataResult } from '../../../../core/datamodel/data-model';
import { ParametrageEcole } from '../../../../core/models/admin/ecole/parametrage-ecole';
import { AnneeScolaire } from '../../../../core/models/referentiels/annee-scolaire';
import { Batiment } from '../../../../core/models/referentiels/batiment';
import { CategoryMenu } from '../../../../core/models/referentiels/category-menu';
import { Classe, ListeClasse } from '../../../../core/models/referentiels/classe';
import { Matiere, MatiereAvecCoefficient } from '../../../../core/models/referentiels/matiere';
import { Menu } from '../../../../core/models/referentiels/menu';
import { Niveau } from '../../../../core/models/referentiels/niveau';
import { NiveauEducation } from '../../../../core/models/referentiels/niveau-eduction';
import { ParametresEtablissement } from '../../../../core/models/referentiels/parametre-etablissement';
import { Salle } from '../../../../core/models/referentiels/salle';
import { Semestre } from '../../../../core/models/referentiels/semestre';
import { Tarif } from '../../../../core/models/referentiels/tarif';
import { TypePaiement } from '../../../../core/models/referentiels/type-paiement';
import { ResponseMessage } from '../../../../core/response/response-message';
import { FraisInscription } from '../../../../core/models/referentiels/frais-inscription';
import { MoyenPaiement } from '../../../../core/models/referentiels/moyen-paiement';


@Injectable({
  providedIn: 'root'
})
export class ReferentielService {

  baseUrl_1 = environment.apiBaseUrl;
  referentiel = this.baseUrl_1 + '/referentiel';
  ecoleUrl = this.baseUrl_1 + '/ecole';

  httpOptions = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  }

  constructor(private readonly http: HttpClient) { }

  /*************     Batiment      ***********/
  getAllBatiments(): Observable<Batiment[]> {
    return this.http.get<Batiment[]>(`${this.referentiel}/batiment`, this.httpOptions);
  }

  getBatimentPaged(page: number = 0, size: number = 100): Observable<DataResult<Batiment>> {
    const url = `${this.referentiel}/batiment/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Batiment>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getBatimentById(id: number): Observable<Batiment> {
    return this.http.get<Batiment>(`${this.referentiel}/batiment/${id}`);
  }

  getBatimentByCode(code: string): Observable<Batiment> {
    return this.http.get<Batiment>(`${this.referentiel}/batiment/by-code/${code}`);
  }

  createBatiment(info: Batiment) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/batiment/save`, info);
  }

  updateBatiment(id: number, value: Batiment) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/batiment/update/${id}`, value);
  }

  deleteBatiment(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/batiment/delete/${id}`);
  }

  /***********      Salle              ****/

  getAllSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.referentiel}/salle`);
  }

  getSalleById(id: number): Observable<Salle> {
    return this.http.get<Salle>(`${this.referentiel}/salle/${id}`);
  }

  createSalle(info: Salle) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/salle/save`, info);
  }

  updateSalle(id: number, value: Salle) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/salle/update/${id}`, value);
  }

  /*************     AnnéesColaire      ***********/

  getAllAnneeScolaires(): Observable<AnneeScolaire[]> {
    return this.http.get<AnneeScolaire[]>(`${this.referentiel}/anneescolaire`, this.httpOptions);
  }

  getAnneeScolairePaged(page: number = 0, size: number = 100): Observable<DataResult<AnneeScolaire>> {
    const url = `${this.referentiel}/anneescolaire/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<AnneeScolaire>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getAnneeScolaireById(id: number): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(`${this.referentiel}/anneescolaire/${id}`);
  }

  getAnneeScolaireByCode(code: string): Observable<AnneeScolaire> {
    return this.http.get<AnneeScolaire>(`${this.referentiel}/anneescolaire/by-code/${code}`);
  }

  createAnneeScolaire(info: AnneeScolaire) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/anneescolaire/save`, info);
  }

  initierNouvelleAnneeScolaire(info: AnneeScolaire) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/anneescolaire/initiernouvelleannee`, info);
  }


  updateAnneeScolaire(id: number, value: AnneeScolaire) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/anneescolaire/update/${id}`, value);
  }

  deleteAnneeScolaire(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/anneescolaire/delete/${id}`);
  }

  /*************     Matiere      ***********/

  getAllMatieres(): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.referentiel}/matiere`, this.httpOptions);
  }

  getMatierePaged(page: number = 0, size: number = 100): Observable<DataResult<Matiere>> {
    const url = `${this.referentiel}/matiere/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Matiere>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getMatiereById(id: number): Observable<Matiere> {
    return this.http.get<Matiere>(`${this.referentiel}/matiere/${id}`);
  }

  getMatiereAvecCoefficient(id: number): Observable<MatiereAvecCoefficient> {
    return this.http.get<MatiereAvecCoefficient>(`${this.referentiel}/matierecoefficient/${id}`);
  }

  getMatiereByCode(code: string): Observable<Matiere> {
    return this.http.get<Matiere>(`${this.referentiel}/matiere/by-code/${code}`);
  }

  createMatiere(info: Matiere) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/matiere/save`, info);
  }

  updateMatiere(id: number, value: Matiere) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/matiere/update/${id}`, value);
  }

  createMatiereAvecCoefficient(info: MatiereAvecCoefficient) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/matierecoefficient/save`, info);
  }

  updateMatiereAvecCoefficient(id: number, value: MatiereAvecCoefficient) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/matierecoefficient/update/${id}`, value);
  }

  deleteMatiere(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/matiere/delete/${id}`);
  }

  /*************     Classe      ***********/

  getAllClasses(): Observable<ListeClasse[]> {
    return this.http.get<ListeClasse[]>(`${this.referentiel}/classe`);
  }

  getClassesByNiveau(niveaudId: number): Observable<ListeClasse[]> {
    return this.http.get<ListeClasse[]>(`${this.referentiel}/classe/niveau/${niveaudId}`);
  }

  getListeClassePaged(page: number = 0, size: number = 100): Observable<DataResult<ListeClasse>> {
    const url = `${this.referentiel}/classe/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<ListeClasse>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getClasseById(id: number): Observable<Classe> {
    return this.http.get<Classe>(`${this.referentiel}/classe/${id}`);
  }

  createClasse(info: Classe) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/classe/save`, info);
  }

  updateClasse(id: number, value: Classe) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/classe/update/${id}`, value);
  }

  deleteClasse(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/classe/delete/${id}`);
  }

  /*************     Semestre      ***********/

  getAllSemestres(): Observable<Semestre[]> {
    return this.http.get<Semestre[]>(`${this.referentiel}/semestre`);
  }

  getSemestrePaged(page: number = 0, size: number = 100): Observable<DataResult<Semestre>> {
    const url = `${this.referentiel}/semestre/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Semestre>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getSemestreById(id: number): Observable<Semestre> {
    return this.http.get<Semestre>(`${this.referentiel}/semestre/${id}`);
  }

  getSemestreByCode(code: string): Observable<Semestre> {
    return this.http.get<Semestre>(`${this.referentiel}/semestre/by-code/${code}`);
  }

  getSemestreByLibelle(libelle: string): Observable<Semestre> {
    return this.http.get<Semestre>(`${this.referentiel}/semestre/by-libelle/${libelle}`);
  }

  createSemestre(info: Semestre) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/semestre/save`, info);
  }

  updateSemestre(id: number, value: Semestre) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/semestre/update/${id}`, value);
  }

  deleteSemestre(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/semestre/delete/${id}`);
  }

  /*************     CategroyMenu      ***********/

  getAllCategoryMenus(): Observable<CategoryMenu[]> {
    return this.http.get<CategoryMenu[]>(`${this.referentiel}/categoryMenu`);
  }


  getCategoryMenuPaged(page: number = 0, size: number = 100): Observable<DataResult<CategoryMenu>> {
    const url = `${this.referentiel}/categoryMenu/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<CategoryMenu>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getCategoryMenuById(id: number): Observable<CategoryMenu> {
    return this.http.get<CategoryMenu>(`${this.referentiel}/categorymenu/${id}`);
  }

  createCategoryMenu(info: CategoryMenu) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/categorymenu/save`, info);
  }

  updateCategoryMenu(id: number, value: CategoryMenu) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/categorymenu/update/${id}`, value);
  }

  deleteCategoryMenu(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/categorymenu/delete/${id}`);
  }

  /*************     Menu      ***********/

  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.referentiel}/menu`);
  }

  getMenuPaged(page: number = 0, size: number = 100): Observable<DataResult<Menu>> {
    const url = `${this.referentiel}/menu/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Menu>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getAllMenusByCategoryMenu(catMenuId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.referentiel}/menu/by-category-menu/${catMenuId}`);
  }

  getMenuById(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${this.referentiel}/menu/${id}`);
  }

  getMenuByCode(code: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.referentiel}/menu/by-code/${code}`);
  }

  getMenuByLibelle(libelle: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.referentiel}/menu/by-libelle/${libelle}`);
  }

  createMenu(info: Menu) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/menu/save`, info);
  }

  updateMenu(id: number, value: Menu) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/menu/update/${id}`, value);
  }

  deleteMenu(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/menu/delete/${id}`);
  }


  /*************     NiveauEducation      ***********/

  getAllNiveauEducations(): Observable<NiveauEducation[]> {
    return this.http.get<NiveauEducation[]>(`${this.referentiel}/niveaueducation`);
  }

  getNiveauEducationPaged(page: number = 0, size: number = 100): Observable<DataResult<NiveauEducation>> {
    const url = `${this.referentiel}/niveaueducation/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<NiveauEducation>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getNiveauEducationById(id: number): Observable<NiveauEducation> {
    return this.http.get<NiveauEducation>(`${this.referentiel}/niveaueducation/${id}`);
  }

  getNiveauEducationByLibelle(libelle: string): Observable<NiveauEducation> {
    return this.http.get<NiveauEducation>(`${this.referentiel}/niveaueducation/by-libelle/${libelle}`);
  }

  createNiveauEducation(info: NiveauEducation) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/niveaueducation/save`, info);
  }

  updateNiveauEducation(id: number, value: NiveauEducation) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/niveaueducation/update/${id}`, value);
  }

  deleteNiveauEducation(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/niveaueducation/delete/${id}`);
  }

  /*************     TypePaiement      ***********/

  getAllTypeMoyenPaiements(): Observable<MoyenPaiement[]> {
    return this.http.get<MoyenPaiement[]>(`${this.referentiel}/moyenpaiement`);
  }

  getAllTypePaiements(): Observable<TypePaiement[]> {
    return this.http.get<TypePaiement[]>(`${this.referentiel}/typePaiement/allTypePaiement`);
  }

  getTypePaiementById(id: number): Observable<TypePaiement> {
    return this.http.get<TypePaiement>(`${this.referentiel}/typePaiement/${id}`);
  }

  createTypePaiement(info: TypePaiement) {
    return this.http.post<void>(`${this.referentiel}/typePaiement/save`, info);
  }

  updateTypePaiement(id: number, value: TypePaiement) {
    return this.http.put<void>(`${this.referentiel}/typePaiement/update/${id}`, value);
  }

  deleteTypePaiement(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/typePaiement/delete/${id}`);
  }

  /*************     Niveau      ***********/

  getAllNiveau(): Observable<Niveau[]> {
    return this.http.get<Niveau[]>(`${this.referentiel}/niveau`);
  }

  getNiveauPaged(page: number = 0, size: number = 100): Observable<DataResult<Niveau>> {
    const url = `${this.referentiel}/niveau/page`;

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<DataResult<Niveau>>(url, {
      ...this.httpOptions,
      params,
    });
  }

  getNiveau(id: number): Observable<Niveau> {
    return this.http.get<Niveau>(`${this.referentiel}/niveau/${id}`);
  }

  createNiveau(info: Niveau) {
    return this.http.post<ResponseMessage>(`${this.referentiel}/niveau/save`, info);
  }

  updateNiveau(id: number, value: Niveau) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/niveau/update/${id}`, value);
  }

  deleteNiveau(id?: number) {
    return this.http.delete<ResponseMessage>(`${this.referentiel}/niveau/delete/${id}`);
  }


  /***************  Tarif ******/

  getTarifByTypeService(typeServiceId: number): Observable<Tarif> {
    return this.http.get<Tarif>(`${this.referentiel}/tarif/typeservice-id/${typeServiceId}`);
  }

  getParametresEtablissement(): Observable<ParametresEtablissement> {
    return this.http.get<ParametresEtablissement>(`${this.referentiel}/config`);
  }

  miseAJoutParametresEtablissement(info: ParametresEtablissement) {
    return this.http.put<ResponseMessage>(`${this.referentiel}/config/update`, info);
  }

  getParametrageEtablissement(ecoleId: number): Observable<ParametrageEcole> {
    return this.http.get<ParametrageEcole>(`${this.ecoleUrl}/config/${ecoleId}`);
  }

  miseAJouParametrageEtablissement(info: ParametrageEcole) {
    return this.http.put<ResponseMessage>(`${this.ecoleUrl}/config/update`, info);
  }

  obtenirFraisInscription(classeId: number, anneeScolaireId: number): Observable<FraisInscription> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('anneeScolaireId', anneeScolaireId.toString());

    return this.http.get<FraisInscription>(`${this.referentiel}/calculer-frais`, { params });
  }

}
