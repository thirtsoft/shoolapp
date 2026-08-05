import { ApiFieldError } from "./api-field-error.model";

export interface ApiResponse<T> {

    success: boolean;

    code: string;

    message: string;

    data: T;

    errors: ApiFieldError[];

    timestamp: string;

}