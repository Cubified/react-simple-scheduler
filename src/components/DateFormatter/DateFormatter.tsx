/**
 * Component for formatting dates according
 *   to a format string.
 */
import React, { useState, useEffect } from "react";
import DATE_UTILS from "../../date";

function date_format(date: Date, fmt: string) {
  if (!date) return "";

  const end = DATE_UTILS.last_of_week(date);
  const full = date.getFullYear().toString();
  let out = "";
  let tmp = "";
  let pad = 0;
  fmt.split("").forEach((c) => {
    if (!Number.isNaN(parseInt(c, 10))) {
      pad = parseInt(c, 10);
      return;
    }

    switch (c) {
      /**
       * DATE
       */
      case "d": // Date number
        tmp = date.getDate().toString();
        break;
      case "x": // Short day of the week
        tmp = DATE_UTILS.SHORT_DAYS_OF_WEEK[date.getDay()];
        break;
      case "X": // Full day of the week
        tmp = DATE_UTILS.LONG_DAYS_OF_WEEK[date.getDay()];
        break;
      case "o": // Short month name
        tmp = DATE_UTILS.SHORT_MONTHS[date.getMonth()];
        break;
      case "O": // Full month name
        tmp = DATE_UTILS.LONG_MONTHS[date.getMonth()];
        break;
      case "W": // Short month name if week spans multiple, otherwise full
        if (end.getMonth() !== date.getMonth()) {
          tmp = `${DATE_UTILS.SHORT_MONTHS[date.getMonth()]} – ${DATE_UTILS.SHORT_MONTHS[end.getMonth()]
            }`;
        } else {
          tmp = DATE_UTILS.LONG_MONTHS[date.getMonth()];
        }
        break;
      case "n": // Month number
        tmp = (date.getMonth() + 1).toString();
        break;
      case "y": // Short year (e.g. 22)
        tmp = full.substring(full.length - 2);
        break;
      case "Y": // Full year (e.g. 2022)
        tmp = date.getFullYear().toString();
        break;

      /**
       * TIME
       */
      case "h": // 12-hour
        if (date.getHours() === 0) tmp = "12";
        else if (date.getHours() <= 12) tmp = date.getHours().toString();
        else tmp = (date.getHours() - 12).toString();
        break;
      case "H": // 24-hour
        tmp = date.getHours().toString();
        break;
      case "M": // Minutes
        tmp = date.getMinutes().toString().padStart(2, "0");
        break;
      case "P": // Period (e.g. AM)
        tmp = date.getHours() < 12 ? "AM" : "PM";
        break;

      case "s": // "Simplest possible" 12-hour time (e.g. "5" or "4:59")
        if (date.getHours() === 0) tmp = "12";
        else if (date.getHours() <= 12) tmp = date.getHours().toString();
        else tmp = (date.getHours() - 12).toString();

        if (date.getMinutes() > 0) tmp += `:${date.getMinutes().toString().padStart(2, "0")}`;
        break;

      default:
        tmp = c;
        break;
    }

    out += tmp.padStart(pad, "0");
    pad = 0;
  });

  return out;
}

function DateFormatter({ date, fmt }: { date: Date, fmt: string }) {
  const [str, setStr] = useState("");

  useEffect(() => setStr(date_format(date, fmt)), [date]);

  return (<>{str}</>);
}

function DateRangeFormatter({ from, to }: { from: Date, to: Date }) {
  const [fromStr, setFromStr] = useState("");
  const [toStr, setToStr] = useState("s P");

  useEffect(() => {
    let from_fixed = from, to_fixed = to;

    if(from > to){
      from_fixed = to;
      to_fixed = from;
    }

    const same_period =
      (from_fixed.getHours() < 12 && to_fixed.getHours() < 12) ||
      (from_fixed.getHours() >= 12 && to_fixed.getHours() >= 12);

    setFromStr(date_format(from_fixed, `s${same_period ? "" : " P"} – `));
    setToStr(date_format(to_fixed, "s P"));
  }, [from, to]);

  return (
    <>{fromStr + toStr}</>
  );
}

export { DateFormatter, DateRangeFormatter, date_format };
