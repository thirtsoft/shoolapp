export interface UserResponse {
    uuid?: string;

    firstName?: string;

    lastName?: string;

    fullName?: string;

    photo?: string;

    email?: string;

    mobile?: string;

    enabled?: boolean;

    accountLocked?: boolean;

    birthDate?: Date;

    lastLoginAt?: Date;

    identifier?: string;

    role?: string;

    organizationLibelle?: string;
}