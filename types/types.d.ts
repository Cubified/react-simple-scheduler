import React from "react";
interface DateRange {
    from: Date;
    to: Date;
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
interface SchedulerProps {
    events: Array<SchedulerExistingEvent>;
    weekStart: Date;
    setWeekStart: (val: Date) => void;
    selected: Date;
    setSelected: (val: Date) => void;
    onRequestAdd: (evt: SchedulerEvent) => void;
    onRequestEdit: (evt: SchedulerEvent) => void;
}
interface CalendarCell {
    date: Date;
    subtle: Boolean;
}
interface CalendarProps {
    setWeekStart: (val: any) => void;
    selected: Date;
    setSelected: (val: any) => void;
}
export { DateRange, SchedulerCalendar, SchedulerEvent, SchedulerCurrentEvent, SchedulerExistingEvent, SchedulerProps, CalendarCell, CalendarProps, };
