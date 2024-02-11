import { Locale, format, isSameDay, parse } from 'date-fns';
import { enUS, sv, it, de, cs, es, sr } from 'date-fns/locale';
import i18next from 'i18next';
import { SupportedLocale } from '~/lib/i18n';

const dateFnsLocales: Record<SupportedLocale, Locale> = {
  en: enUS,
  sv,
  it,
  de,
  cs,
  es,
  no: sv,
  sr,
};

export const isDateToday = (date: string): boolean => {
  const parsed = parse(date, 'yyyy-MM-dd', new Date());
  if (isNaN(parsed?.getTime())) {
    return false;
  }
  return isSameDay(new Date(), parsed);
};

export const dateToReadable = (date: string): string => {
  const parsed = parse(date, 'yyyy-MM-dd', new Date());
  if (isNaN(parsed?.getTime())) {
    return '';
  }
  return format(parsed, 'P', {
    locale: dateFnsLocales[i18next.language as SupportedLocale],
  });
};

export const padTime = (time: number, len = 2) =>
  String(time).padStart(len, '0');
