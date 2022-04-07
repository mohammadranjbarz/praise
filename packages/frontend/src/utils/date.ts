import { parse, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import jstz from 'jstz';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_FORMAT_TZ = 'yyyy-MM-dd z';
export const DATE_FORMAT_LONG = 'yyyy-MM-dd HH:mm';

export const parseDate = (
  date: string,
  pattern: string = DATE_FORMAT
): Date => {
  return parse(date, pattern, new Date());
};

export const localDateToUtc = (dateLocal: Date): Date => {
  const timezone = jstz.determine().name();
  const dateUtc = zonedTimeToUtc(dateLocal, timezone);

  return dateUtc;
};

export const utcDateToLocal = (dateUtc: Date): Date => {
  const timezone = jstz.determine().name();
  const dateLocal = utcToZonedTime(dateUtc, timezone);

  return dateLocal;
};

export const localizeAndFormatIsoDate = (
  dateIso: string,
  pattern: string = DATE_FORMAT
): string => {
  const dateUtc = parseISO(dateIso);
  const dateLocal = utcDateToLocal(dateUtc);

  return format(dateLocal, pattern);
};

export const localizeAndFormatIsoDateLong = (dateIso: string): string => {
  return localizeAndFormatIsoDate(dateIso, DATE_FORMAT_LONG);
};

export const formatIsoDateUTC = (
  dateIso: string,
  pattern: string = DATE_FORMAT_TZ
): string => {
  const date = parseISO(dateIso);
  const dateUtc = utcToZonedTime(date, 'UTC');
  const formattedDateUtc = format(dateUtc, pattern, {
    timeZone: 'UTC',
  });

  return formattedDateUtc;
};