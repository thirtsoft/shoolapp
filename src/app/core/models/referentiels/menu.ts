
export interface Menu {
    id?: number;

    libelle?: string;

    description?: string;

    //   categoryMenuDTO?: CategoryMenu;
}

export interface MenuAddEdit {
    id?: number;

    libelle?: string;

    description?: string;

    categoryMenuId?: number;
}