const FRENCH_MOBILE_REGEX = /^(?:\+33|0)[67](?:[ .-]?\d{2}){4}$/;

export function isValidFrenchPhone(value: string): boolean {
  const phone = value.trim();

  if (!phone) return false;

  return FRENCH_MOBILE_REGEX.test(phone);
}

export function validateFrenchPhoneRHF(value: string): true | string {
  if (!value?.trim()) {
    return "Numéro de téléphone requis";
  }

  if (!isValidFrenchPhone(value)) {
    return "Numéro de téléphone français invalide";
  }

  return true;
}