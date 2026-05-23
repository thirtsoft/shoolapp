
export const ROLE_ROUTES: Record<string, string> = {
  'agent_admin': '/admin',
  'administrateur_ecole': '/admin',
  'super_administrateur': '/admin',

  'parent_deleve': '/parent',

  'enseignant': '/enseignant',

  'default': '/login'
};


export const ADMIN_ROLES: string[] = [
  'agent_admin',
  'administrateur_ecole',
  'super_administrateur'
];


export enum RoleType {
  AGENT_ADMIN = 'agent_admin',
  ADMINISTRATEUR_ECOLE = 'administrateur_ecole',
  SUPER_ADMINISTRATEUR = 'super_administrateur',
  PARENT_ELEVE = 'parent_deleve',
  ENSEIGNANT = 'enseignant'
}