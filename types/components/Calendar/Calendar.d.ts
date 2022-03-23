/// <reference types="react" />
import { CalendarProps } from "../../types";
import "./Calendar.css";
/**
 * Small calendar preview panel
 */
declare function Calendar({ setWeekStart, selected, setSelected }: CalendarProps): JSX.Element;
export default Calendar;
