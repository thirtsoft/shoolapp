export interface ActiviteEnseignant {
    id: number;
    type: 'REUNION' | 'EVENEMENT';
    libelle: string;
    description?: string;
    date: string;
    heureDebut: string;
    heureFin?: string;
    typeReunion?: string;
    salle?: string;
    motifAnnulation?: string;
}