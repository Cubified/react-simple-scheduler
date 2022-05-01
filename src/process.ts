import {
  EventRepetition,
  SchedulerExistingEvent
} from "./types";
import DATE_UTILS from "./date";

function process_events(events: Array<SchedulerExistingEvent>, weekStart: Date) {
  const out: Array<SchedulerExistingEvent> = [];
  events.forEach((evt: SchedulerExistingEvent) => {
    switch(evt.repeat ?? 0){
      case EventRepetition.None:
        out.push({
          ...evt,
          original: evt,
        });
        break;
      case EventRepetition.Daily:
        for(let i = 0; i < 7; i++) {
          out.push({
            ...evt,
            from: DATE_UTILS.copy_time(DATE_UTILS.walk_day(weekStart, i), evt.from),
            to: DATE_UTILS.copy_time(DATE_UTILS.walk_day(weekStart, i), evt.to),
            original: evt,
          });
        }
        break;
      case EventRepetition.Monthly:
        if(Math.abs(DATE_UTILS.difference_days(weekStart, DATE_UTILS.first_of_week(evt.from)) + 1) % 28 > 0) break;
        /* Fall through */
      case EventRepetition.Biweekly:
        if(Math.abs(DATE_UTILS.difference_days(weekStart, DATE_UTILS.first_of_week(evt.from)) + 1) % 14 > 0) break;
        /* Fall through */
      case EventRepetition.Weekly:
        out.push({
          ...evt,
          from: DATE_UTILS.copy_time(DATE_UTILS.walk_day(weekStart, evt.from.getDay()), evt.from),
          to: DATE_UTILS.copy_time(DATE_UTILS.walk_day(weekStart, evt.to.getDay()), evt.to),
          original: evt,
        });
        break;
      case EventRepetition.Annually:
        if(!DATE_UTILS.is_within_week(weekStart, evt.from, true)) break;
        out.push({
          ...evt,
          from: DATE_UTILS.copy_time(DATE_UTILS.copy_ymd(weekStart, evt.from, true), evt.from),
          to: DATE_UTILS.copy_time(DATE_UTILS.copy_ymd(weekStart, evt.to, true), evt.to),
          original: evt,
        });
        break;
      case EventRepetition.Weekday:
        for(let i = 1; i < 6; i++) {
          out.push({
            ...evt,
            from: DATE_UTILS.copy_time(DATE_UTILS.walk_day(weekStart, i), evt.from),
            to: DATE_UTILS.copy_time(DATE_UTILS.walk_day(weekStart, i), evt.to),
            original: evt,
          });
        }
        break;
    }
  });
  return out;
}

export default process_events;
