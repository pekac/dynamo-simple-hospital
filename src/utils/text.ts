export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function decapitalize(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
