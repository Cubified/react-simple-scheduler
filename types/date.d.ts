/**
 * Date utility functions and constants
 */
import { DateRange } from "./types";
declare const _default: {
    walk_month: (date: Date, amt?: number) => Date;
    walk_day: (date: Date, amt?: number) => Date;
    walk_hour: (date: Date, amt?: number) => Date;
    set_hour: (hr: number) => Date;
    first_of_month: (date: Date) => Date;
    first_of_week: (date: Date) => Date;
    last_of_week: (date: Date) => Date;
    is_within_week: (wk: Date, day: Date) => boolean;
    compare_dates: (a: Date, b: Date) => boolean;
    compare_times: (a: Date, b: Date) => boolean;
    difference: (a: Date, b: Date) => number;
    dates_overlap: (a: DateRange, b: DateRange) => boolean;
    copy_ymd: (date: Date, ymd: Date) => Date;
    copy_time: (date: Date, time: Date) => Date;
    TODAY: Date;
    SATURDAY: number;
    SHORT_DAYS_OF_WEEK: string[];
    LONG_DAYS_OF_WEEK: string[];
    SHORT_MONTHS: string[];
    LONG_MONTHS: string[];
    DAY_IN_MS: number;
    HOUR_IN_MS: number;
    MINUTE_IN_MS: number;
};
export default _default;
