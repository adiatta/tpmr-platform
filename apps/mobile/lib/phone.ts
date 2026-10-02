/** Validation de numéro de téléphone français, utilisée côté dashboard
 * (formulaires chauffeurs / établissements / enfants) ET réutilisable
 * telle quelle côté mobile — aucune dépendance externe. */

const PARENS_ZERO = /\(0\)/g;
const NON_DIGIT = /\D/g;
const FR_MOBILE_OR_LANDLINE = /^0[1-9]\d{8}$/;

/** Normalise un numéro français en 10 chiffres commençant par 0
 * (ex. "0612345678"), quel que soit le format d'entrée (espaces, points,
 * tirets, +33, 0033, notation "(0)"). Renvoie null si ce n'est pas un
 * numéro français valide. */
export function normalizeFrenchPhone(value: string): string | null {
  if (!value) return null;

  const cleaned = value.replace(PARENS_ZERO, "");
  let digits = cleaned.replace(NON_DIGIT, "");

  if (digits.startsWith("0033")) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("33") && digits.length === 11) {
    digits = "0" + digits.slice(2);
  }

  return FR_MOBILE_OR_LANDLINE.test(digits) ? digits : null;
}

export function isValidFrenchPhone(value: string): boolean {
  return normalizeFrenchPhone(value) !== null;
}

/** Affichage lisible à partir du format normalisé : "0612345678" ->
 * "06 12 34 56 78". Si la valeur n'est pas un numéro normalisé valide,
 * elle est renvoyée telle quelle (ne casse jamais l'affichage). */
export function formatFrenchPhone(value: string): string {
  const normalized = normalizeFrenchPhone(value) ?? value;
  if (!FR_MOBILE_OR_LANDLINE.test(normalized)) return value;
  return normalized.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

/** Compatible react-hook-form : `{...register("phone", { validate:
 * validateFrenchPhoneRHF })}`. Renvoie `true` (valide) ou un message
 * d'erreur (invalide) — c'est le contrat attendu par `validate`. */
export function validateFrenchPhoneRHF(value: string): true | string {
  return isValidFrenchPhone(value) || "Numéro invalide (ex. 06 12 34 56 78)";
}

/** Même chose pour un champ optionnel (ex. téléphone d'établissement) :
 * une valeur vide est valide, seule une valeur non vide mais incorrecte
 * est rejetée. */
export function validateFrenchPhoneOptionalRHF(value: string): true | string {
  if (!value || value.trim() === "") return true;
  return validateFrenchPhoneRHF(value);
}