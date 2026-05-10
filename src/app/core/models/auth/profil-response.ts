
import { Action } from "./action";

export interface ProfilResponse {
    id: number;
    code: string;
    actionListResponses: Action[];
}
