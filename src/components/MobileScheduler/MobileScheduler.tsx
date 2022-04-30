import React, { useState, useEffect, useRef } from "react";
import DATE_UTILS from "../../date";
import {
  DateFormatter,
  DateRangeFormatter,
} from "../DateFormatter";
import {
  SchedulerEvent,
  SchedulerExistingEvent,
  MobileSchedulerStyles
} from "../../types";
import "./MobileScheduler.scss";

export default function MobileScheduler(
  { events, onRequestEdit, style }:
  {
    events: Array<SchedulerExistingEvent>,
    onRequestEdit: (evt: SchedulerEvent) => void,
    style?: MobileSchedulerStyles
  }
) {
  const [height, setHeight] = useState<number>(-1);
  const scrollRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const sorted: Array<SchedulerExistingEvent>
    = events.sort((a: SchedulerExistingEvent, b: SchedulerExistingEvent) =>
      a.from.getTime() - b.from.getTime());
  let last: Date = new Date(0);
  let has_shown_ticker: boolean = false;

  useEffect(() => {
    if (height > -1) scrollRef.current.scrollTo(0, height);
  }, [height]);

  return (
    <div
      className="react-simple-mobile-scheduler"
      ref={scrollRef}
      style={style?.container ?? {}}
    >
      {sorted.map((evt, ind) => {
        const show_date: boolean = !DATE_UTILS.compare_dates(last, evt.from);
        const show_month: boolean = last.getMonth() !== evt.from.getMonth();
        const show_ticker: boolean = last < DATE_UTILS.TODAY && evt.from >= DATE_UTILS.TODAY;
        last = evt.from;
        has_shown_ticker = has_shown_ticker || show_ticker;

        if (show_ticker && height === -1) setHeight((ind + 2) * 53);

        return (
          <span key={evt.to.getTime() + evt.from.getTime() + evt.name}>
            {show_date && ind > 0 && !show_ticker && <br />}
            {show_month && (
              <div className="month">
                <div className="line" />
                <span className="format">
                  <DateFormatter date={evt.from} fmt="O Y" />
                </span>
                <div className="line" />
              </div>
            )}
            {show_ticker && (
              <div className="ticker">
                <div className="ball" />
                <div className="line" />
              </div>
            )}
            <div className="event" style={style?.event ?? {}}>
              <div className="date">
                {show_date && (
                  <>
                    <div className="number">
                      <DateFormatter date={evt.from} fmt="d" />
                    </div>
                    <DateFormatter date={evt.from} fmt="x" />
                  </>
                )}
              </div>
              <button
                type="button"
                className="box"
                style={{
                  ...evt.style,
                  ...(style?.box ?? {}),
                }}
                onClick={() => onRequestEdit(evt)}
              >
                <div>
                  <div className="range">
                    <DateRangeFormatter from={evt.from} to={evt.to} />
                  </div>
                  <div className="name">{evt.name}</div>
                </div>
              </button>
            </div>
          </span>
        );
      })}
      {!has_shown_ticker && (
        <div className="ticker">
          <div className="ball" />
          <div className="line" />
        </div>
      )}
    </div>
  );
}
