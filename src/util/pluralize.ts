const pluralRules = new Intl.PluralRules('en-US');

export function pluralize(count: number, singular: string, plural?: string) {
  return pluralRules.select(count) === 'one' ? singular : plural || `${singular}s`;
}
