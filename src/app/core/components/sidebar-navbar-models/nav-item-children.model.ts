import { NavItem } from "./nav-item.model";

export interface NavItemChildren {
  route?: string;
  ico: string;
  label: string;
  badge?: string;
  section?: string;
  children?: NavItem[];
}