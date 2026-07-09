export interface NavLink {
  label: string;
  href: string;
  sectionId: string;
}

export interface NavAction {
  label: string;
  href: string;
}

export interface NavigationConfig {
  links: NavLink[];
  signIn: NavAction;
}
