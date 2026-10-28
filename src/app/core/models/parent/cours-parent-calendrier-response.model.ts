import { AnneeScolaireResponse, ClasseResponse, EmploiDuTempsResponse, MatiereResponse, SalleResponse } from "../enseignant/cours-enseignant-calendrier.model";

export interface CoursParentCalendrier {
    coursId: number;
    courseUuid: string;

    libelle: string;

    jourSemaine: string;
    heureDebut: string;
    heureFin: string;

    salle?: SalleResponse | null;
    classe?: ClasseResponse | null;
    matiere?: MatiereResponse | null;
    anneeScolaire?: AnneeScolaireResponse | null;
    emploiDuTemps?: EmploiDuTempsResponse | null;

    enseignementId: number;

    dateDebut?: string | null;
    dateFin?: string | null;
}