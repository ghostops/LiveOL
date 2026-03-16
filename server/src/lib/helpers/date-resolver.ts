import { addDays, addMonths, format, subDays } from 'date-fns';

export class DateResolver {
  static resolve(dateString: string): string {
    const today = new Date();

    switch (dateString) {
      case 'AUTO_YESTERDAY':
        return format(subDays(today, 1), 'yyyy-MM-dd');
      case 'AUTO_TODAY':
        return format(today, 'yyyy-MM-dd');
      case 'AUTO_TOMORROW':
        return format(addDays(today, 1), 'yyyy-MM-dd');
      case 'AUTO_PLUS_12_MONTHS':
        return format(addMonths(today, 12), 'yyyy-MM-dd');
      default:
        return dateString; // Return as-is if not a special token
    }
  }
}
