import {
  Utensils,
  Baby,
  Shield,
  Stethoscope,
  Calendar,
  Heart,
  Carrot,
  ChefHat,
  Moon,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

/** Registre des icônes Lucide référencées par clé dans la config de navigation */
export const SECTION_ICON_MAP = {
  Utensils,
  Baby,
  Shield,
  Stethoscope,
  Calendar,
  Heart,
  Carrot,
  ChefHat,
  Moon,
  AlertTriangle,
  ShieldCheck,
};

export function resolveSectionIcon(iconKey) {
  return SECTION_ICON_MAP[iconKey] || Utensils;
}
