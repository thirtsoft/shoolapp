export interface CoursParentAbsenceResponse {
    coursId: number;
    libelle: string;
    heureDebut: string;
    heureFin: string;
    salleId?: number;
    enseignementId: number;
    classeId: number;
    classeLibelle: string;
    matiereId: number;
    matiereLibelle: string;
}

