export interface ForgotPasswordResponse {
    success: boolean;
    code: string;
    message: string;
    data: {
        temporaryPassword: string;
        emailSent: boolean;
    };
    errors: any[];
    timestamp: string;
}