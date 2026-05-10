import { Menu } from "./menu";

export interface CategoryMenu {
    id?: number;

    libelle?: string;

    menuDTOs?: Menu[];

    ecole?: number;

}