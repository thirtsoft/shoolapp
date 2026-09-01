import { TypeRelationParent } from "./type-relation-parent.model";

export interface CreateEleveParentRequest {
  parentExist?: boolean;
  parentUuid?: string;
  telephone?: string;
  email?: string;
  sexe?: string;
  nom?: string;
  prenom?: string;
  civilite?: string;
  address?: string;
  profession?: string;

  typeRelation: TypeRelationParent;

}