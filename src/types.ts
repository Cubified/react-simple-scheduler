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
  /**
   * The array of events to be drawn on the scheduler.
   */
  events: SchedulerExistingEvent[];
  /**
   * The currently-selected date.
   *
   * This can be selected using the `Calendar` component.
   */
  selected: Date;
  /**
   * Callback to set the selected date.
   */
  setSelected: (val: Date) => void;
  /**
   * The function called when the user requests a new event be created.
   */
  onRequestAdd: (evt: SchedulerEvent) => void;
  /**
   * The function called when the user clicks on an existing event.
   */
  onRequestEdit: (evt: SchedulerEvent | undefined) => void;
  /**
   * Whether click-and-drag event creation is enabled.
   */
  editable?: boolean;
  /**
   * The style objects to be passed to the calendar's elements.
   *
   * See [here](https://github.com/Cubified/react-simple-scheduler?tab=readme-ov-file#style-1) for more information.
   */
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

interface TickerProps {
  weekStart: Date;
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>;
  headerRef: React.MutableRefObject<HTMLTableHeaderCellElement>;
  hasResized: number;
}

interface EventProps {
  processedEvents: Array<SchedulerExistingEvent>;
  weekStart: Date,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>;
  headerRef: React.MutableRefObject<HTMLTableHeaderCellElement>;
  currentEvent: SchedulerCurrentEvent;
  setCurrentEvent: (val: SchedulerCurrentEvent) => void;
  dummyCurrentEvent: SchedulerCurrentEvent;

  editable: boolean | undefined;
  onRequestAdd: (evt: SchedulerEvent) => void;
  onRequestEdit: (evt: SchedulerEvent | undefined) => void;
  hasResized: number;
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

  TickerProps,
  EventProps
}
