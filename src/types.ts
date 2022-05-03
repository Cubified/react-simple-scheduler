import React from "react";

enum EventRepetition {
  None,
  Daily,
  Weekly,
  Biweekly,
  Monthly,
  Annually,
  Weekday
}

interface DateRange {
  from: Date;
  to: Date;
}

interface SchedulerRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SchedulerCalendar {
  name: string;
  enabled: boolean | (() => boolean);
}

interface SchedulerEvent extends DateRange {
  calendar: SchedulerCalendar | Array<SchedulerCalendar>;
  is_current: boolean;
  style?: React.CSSProperties | ((evt: SchedulerEvent) => React.CSSProperties);
}

interface SchedulerCurrentEvent extends SchedulerEvent {
  visible: boolean;
}

interface SchedulerExistingEvent extends SchedulerEvent {
  name: string;
  repeat: EventRepetition;
  original?: SchedulerEvent;
}

interface SchedulerStyles {
  container: React.CSSProperties;
  head: React.CSSProperties;
  body: React.CSSProperties;
}

interface MobileSchedulerStyles {
  container: React.CSSProperties;
  event: React.CSSProperties;
  box: React.CSSProperties;
}

interface SchedulerProps {
  events: Array<SchedulerExistingEvent>;

  selected: Date;
  setSelected: (val: Date) => void;

  onRequestAdd: (evt: SchedulerEvent) => void;
  onRequestEdit: (evt: SchedulerEvent | undefined) => void;

  editable?: boolean,
  style?: SchedulerStyles | null;
}

interface CalendarStyles {
  container: React.CSSProperties;
  head: React.CSSProperties;
  body: React.CSSProperties;
}

interface CalendarCell {
  date: Date;
  subtle: Boolean;
}

interface CalendarProps {
  selected: Date;
  setSelected: (val: Date) => void;
  style?: CalendarStyles | null;
}

export {
  EventRepetition,
  DateRange,

  SchedulerRectangle,
  SchedulerCalendar,
  SchedulerEvent,
  SchedulerCurrentEvent,
  SchedulerExistingEvent,
  SchedulerStyles,
  MobileSchedulerStyles,
  SchedulerProps,

  CalendarStyles,
  CalendarCell,
  CalendarProps,
}
