/**
 * Date utility functions and constants
 */
import { DateRange } from "./types";

const TODAY = new Date();

const SATURDAY = 6;

const SHORT_DAYS_OF_WEEK = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
const LONG_DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = MINUTE_IN_MS * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

const walk_month = (date: Date, amt: number = 1) => {
  const out = new Date(date);
  out.setMonth(out.getMonth() + amt);
  return out;
};
const walk_day = (date: Date, amt: number = 1) => {
  const out = new Date(date);
  out.setDate(out.getDate() + amt);
  return out;
};
const walk_hour = (date: Date, amt: number = 1) => {
  const out = new Date(date);
  out.setHours(out.getHours() + amt);
  return out;
};

const set_hour = (hr: number) => {
  const out = new Date(TODAY);
  out.setHours(hr);
  return out;
};

const first_of_month = (date: Date) => {
  const out = new Date(date);
  out.setDate(1);
  return out;
};
const first_of_week = (date: Date) => {
  const out = new Date(date);
  out.setDate(out.getDate() - out.getDay());
  return out;
};
const last_of_week = (date: Date) => {
  const out = new Date(date);
  out.setDate(out.getDate() + 6);
  return out;
};

const is_within_week = (wk: Date, day: Date) => {
  const first = new Date(wk);
  first.setDate(first.getDate() - first.getDay());
  first.setHours(0, 0, 0);

  const last = new Date(first);
  last.setDate(last.getDate() + 7);
  last.setHours(11, 59, 59);

  return day >= first && day <= last;
};

const compare_dates = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
const compare_times = (a: Date, b: Date) =>
  a.getHours() === b.getHours() &&
  a.getMinutes() === b.getMinutes() &&
  a.getSeconds() === b.getSeconds();

const difference = (a: Date, b: Date) =>
  (a.getHours() - b.getHours()) * HOUR_IN_MS + (a.getMinutes() - b.getMinutes()) * MINUTE_IN_MS;
const dates_overlap = (a: DateRange, b: DateRange) => a.from <= b.to && a.to >= b.from;
const dates_overlap_exclusive = (a: DateRange, b: DateRange) => a.from < b.to && a.to > b.from;

const copy_ymd = (date: Date, ymd: Date) => {
  const tmp = new Date(ymd);
  const cpy = new Date(date);
  cpy.setFullYear(tmp.getFullYear());
  cpy.setMonth(tmp.getMonth());
  cpy.setDate(tmp.getDate());
  return cpy;
};
const copy_time = (date: Date, time: Date) => {
  const tmp = new Date(time);
  const cpy = new Date(date);
  cpy.setHours(tmp.getHours());
  cpy.setMinutes(tmp.getMinutes());
  return cpy;
};

export default {
  /*
   * UTILITIES
   */
  walk_month,
  walk_day,
  walk_hour,

  set_hour,

  first_of_month,
  first_of_week,
  last_of_week,

  is_within_week,

  compare_dates,
  compare_times,

  difference,

  dates_overlap,
  dates_overlap_exclusive,

  copy_ymd,
  copy_time,

  /*
   * CONSTANTS
   */
  TODAY,

  SATURDAY,
  SHORT_DAYS_OF_WEEK,
  LONG_DAYS_OF_WEEK,
  SHORT_MONTHS,
  LONG_MONTHS,

  DAY_IN_MS,
  HOUR_IN_MS,
  MINUTE_IN_MS,
};
