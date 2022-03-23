import React from "react";

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
  enabled: boolean;
}

interface SchedulerEvent extends DateRange {
  calendar: SchedulerCalendar;
  is_current: boolean;
  style: React.CSSProperties;
}

interface SchedulerCurrentEvent extends SchedulerEvent {
  visible: boolean;
}

interface SchedulerExistingEvent extends SchedulerEvent {
  name: string;
  calendar: SchedulerCalendar;
}

interface SchedulerStyles {
  container: React.CSSProperties;
  head: React.CSSProperties;
  body: React.CSSProperties;
}

interface SchedulerProps {
  events: Array<SchedulerExistingEvent>;

  selected: Date;
  setSelected: (val: Date) => void;

  onRequestAdd: (evt: SchedulerEvent) => void;
  onRequestEdit: (evt: SchedulerEvent) => void;

  style: SchedulerStyles | null;
}

interface CalendarCell {
  date: Date;
  subtle: Boolean;
}

interface CalendarProps {
  selected: Date;
  setSelected: (val: any) => void;
  style: React.CSSProperties | null;
}

export {
  DateRange,

  SchedulerRectangle,
  SchedulerCalendar,
  SchedulerEvent,
  SchedulerCurrentEvent,
  SchedulerExistingEvent,
  SchedulerProps,

  CalendarCell,
  CalendarProps,
}
