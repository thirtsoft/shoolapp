export const SETUP_MOCK = {
  etablissement: {
    nom: 'Complexe Scolaire Excellence',
    type: 'PRIVE',
    telephone: '+221 77 123 45 67',
    email: 'contact@excellence.sn',
    adresse: 'Dakar'
  },

  anneeScolaire: {
    libelle: '2026-2027',
    dateDebut: '2026-10-01',
    dateFin: '2027-07-31'
  },

  niveaux: [
    {
      id: 1,
      libelle: 'Préscolaire',
      selected: false
    },
    {
      id: 2,
      libelle: 'Primaire',
      selected: true
    },
    {
      id: 3,
      libelle: 'Collège',
      selected: true
    },
    {
      id: 4,
      libelle: 'Lycée',
      selected: true
    }
  ]
};