import React, { useState, useEffect } from "react";
import DATE_UTILS from "../../date";
import { DateFormatter } from "../DateFormatter";
import { CalendarProps, CalendarCell } from "../../types";
import "./Calendar.scss";

/**
 * Small calendar preview panel
 */
function Calendar({ selected, setSelected, style }: CalendarProps) {
  const [rows, setRows] = useState<CalendarCell[][]>([]);
  const [viewMonth, setViewMonth] = useState<Date>(DATE_UTILS.first_of_month(DATE_UTILS.TODAY));

  /*
   * Generate the grid of days whenever
   *   the currently-viewed month changes
   */
  useEffect(() => {
    const tmp: Date = DATE_UTILS.first_of_week(viewMonth);

    const out_full: CalendarCell[][] = [];
    let out: CalendarCell[] = [];

    for (let i = 0; i < 7 * 6; i++) {
      out.push({
        date: new Date(tmp),
        subtle: tmp.getMonth() !== viewMonth.getMonth(),
      });

      if (tmp.getDay() === DATE_UTILS.SATURDAY) {
        out_full.push(out);
        out = [];
      }

      tmp.setDate(tmp.getDate() + 1);
    }
    setRows(out_full);
  }, [viewMonth]);

  /*
   * Update the view month when
   *   the user selects a new date
   */
  useEffect(() => setViewMonth(DATE_UTILS.first_of_month(selected)), [selected]);

  return (
    <div className="react-simple-calendar" style={style ?? {}}>
      <div className="head">
        <span className="month">
          <DateFormatter date={viewMonth} fmt="O Y" />
        </span>
        <div>
          <button
            type="button"
            className="chevron"
            onClick={() => setViewMonth(DATE_UTILS.walk_month(viewMonth, -1))}
          >
            <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg" transform="translate(0 4)">
              <line x1="7.35337" y1="0.353553" x2="0.353371" y2="7.35355" stroke="black" />
              <line x1="0.353569" y1="6.64645" x2="7.35357" y2="13.6464" stroke="black" />
            </svg>
          </button>
          <button
            type="button"
            className="chevron flipped"
            onClick={() => setViewMonth(DATE_UTILS.walk_month(viewMonth))}
          >
            <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg" transform="translate(0 4)">
              <line x1="7.35337" y1="0.353553" x2="0.353371" y2="7.35355" stroke="black" />
              <line x1="0.353569" y1="6.64645" x2="7.35357" y2="13.6464" stroke="black" />
            </svg>
          </button>
        </div>
      </div>
      <table className="body" cellSpacing={0} cellPadding={0}>
        <thead>
          <tr>
            <th>S</th>
            <th>M</th>
            <th>T</th>
            <th>W</th>
            <th>T</th>
            <th>F</th>
            <th>S</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: CalendarCell[]) => (
            <tr key={row[0].date.getTime()}>
              {row.map((cell: CalendarCell) => (
                <td
                  role="presentation"
                  key={cell.date.getDate()}
                  className={`
                        ${cell.subtle ? "subtle" : ""}
                        ${DATE_UTILS.compare_dates(cell.date, DATE_UTILS.TODAY) ? "today" : ""}
                        ${DATE_UTILS.compare_dates(cell.date, selected) ? "selected" : ""}
                      `}
                  height="20"
                  onClick={() => setSelected(cell.date)}
                >
                  {cell.date.getDate()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Calendar;
