import { LoginCredentialsResponse } from "./login-credentials-response.model";
import { NotificationResponseResult } from "./notification-response-result.model";
import { UserResponse } from "./user-response.model";

export interface UserCreateResponse {
    user: UserResponse;
    credentials: LoginCredentialsResponse;
    notification: NotificationResponseResult;
}