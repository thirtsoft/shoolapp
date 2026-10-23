export interface SecurityCredentialResponse {
    securityCredentialId: number;
    securityCredentialUuid: string;
    userUuid: string;
    credentialType: string;
    identifier: string;
    enabled: boolean;
    locked: boolean;
    mustChangePassword: boolean;
    expiresAt: Date;

}