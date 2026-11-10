export interface UpdateLogoOrganizationResponse {
  organizationId: number;
  organizationUuid: string;
  logoStored: boolean;
  logoMessage: string;
}

export interface UpdateDocumentOrganizationResponse {
  organizationId: number;
  organizationUuid: string;
  documentStored: boolean;
  documentMessage: string;
}