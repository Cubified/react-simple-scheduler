/// <reference types="react" />
import { SchedulerProps } from "../../types";
import "./Scheduler.css";
/**
 * Main scheduler/timetable view
 */
declare const Scheduler: ({ events, weekStart, setWeekStart, selected, setSelected, onRequestAdd, onRequestEdit, }: SchedulerProps) => JSX.Element;
export default Scheduler;
