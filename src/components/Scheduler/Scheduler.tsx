import React, { useState, useEffect, useRef } from "react";
import DATE_UTILS from "../../date";
import { DateFormatter, DateRangeFormatter } from "../DateFormatter";
import { DateRange, SchedulerRectangle, SchedulerEvent, SchedulerCurrentEvent, SchedulerProps } from "../../types";
import "./Scheduler.scss";

/**
 * Main scheduler/timetable view
 */
const Scheduler = ({
  events,

  selected,
  setSelected,

  onRequestAdd,
  onRequestEdit,

  style
}: SchedulerProps) => {
  const dummyCurrentEvent: SchedulerCurrentEvent = {
    from: new Date(0),
    to: new Date(0),
    visible: false,
    calendar: { name: "", enabled: true },
    is_current: true,
    style: {}
  };

  /*
   * STATE and REFS
   */
  const [currentEvent, setCurrentEvent] = useState<SchedulerCurrentEvent>(dummyCurrentEvent);
  const [weekStart, setWeekStart] = useState(DATE_UTILS.first_of_week(selected));
  const [rerender, setRerender] = useState(0);

  const scrollRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const eventSizeRef = useRef() as React.MutableRefObject<HTMLTableDataCellElement>;
  const headerRef = useRef() as React.MutableRefObject<HTMLTableHeaderCellElement>;

  /*
   * HOOKS and CALLBACKS
   */
  useEffect(() => {
    if(!scrollRef.current) return;
    if (!eventSizeRef.current) return;

    scrollRef.current.scrollTo(0, eventSizeRef.current.offsetHeight * 8);

    function resize(){
      setRerender(Math.random());
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => setWeekStart(DATE_UTILS.first_of_week(selected)), [selected]);

  /*
   * STYLE and FORMATTING
   */
  function date_from_pos(x: number, y: number) {
    const rect = eventSizeRef.current.getBoundingClientRect();

    const xmod = Math.floor((x - rect.x) / rect.width);
    const ymod = Math.floor((y - rect.y) / rect.height);

    if (xmod < 0 || ymod < 0) return null;

    const ymin_orig =
      (((y - rect.y) % rect.height) / rect.height) * 60;
    const ymin = Math.floor(ymin_orig / 15) * 15;

    const out = DATE_UTILS.walk_day(weekStart, xmod);
    out.setHours(ymod, ymin, 0);

    return out;
  }

  function pos_from_date(date: Date) {
    if(!eventSizeRef.current || !headerRef.current) return { x: 0, y: 0 };

    const rect: SchedulerRectangle = eventSizeRef.current.getBoundingClientRect();
    const header: SchedulerRectangle = headerRef.current.getBoundingClientRect();

    const x: number = date.getDay() * rect.width + header.width;
    const y: number =
      date.getHours() * rect.height +
      (date.getMinutes() / 60) * rect.height +
      header.height;

    if(Number.isNaN(x) || Number.isNaN(y)) return {x: 0, y: 0};

    return { x, y };
  }

  function styles_from_event(event: SchedulerEvent): React.CSSProperties {
    const { from, to, calendar, style, is_current }: SchedulerEvent = event;

    if (!from || !to) return {};
    if (
      !DATE_UTILS.is_within_week(weekStart, from) ||
      (!calendar.enabled && !is_current)
    ) {
      return {
        display: "none",
      };
    }

    const pos = pos_from_date(from);
    const dif = DATE_UTILS.difference(to, from);
    if (dif === 0) return {};

    const out: React.CSSProperties = {
      top: `${pos.y}px`,
      height: `${Math.floor(
        (dif / DATE_UTILS.HOUR_IN_MS) * eventSizeRef.current.getBoundingClientRect().height
      )}px`,
      ...style,
    };

    if (!is_current) {
      // Compute overlapping elements to determine element width
      //   (Logic mostly copied from observations about Google Calendar,
      //   with a few tweaks)
      const overlaps: Array<SchedulerEvent> = [];
      let x: number = pos.x;
      let w: number = 0.95 * eventSizeRef.current.getBoundingClientRect().width;
      events.forEach((evt) => {
        if (evt.calendar.enabled && DATE_UTILS.dates_overlap(evt as DateRange, { from, to })) {
          overlaps.push(evt);
       }
      });

      if (overlaps.length > 0) {
        let last: SchedulerEvent;
        overlaps.sort((a: SchedulerEvent, b: SchedulerEvent) => a.from.getTime() - b.from.getTime());
        overlaps.every((evt, ind) => {
          if (last) {
            if (
              Math.abs(DATE_UTILS.difference(last.from, evt.from)) <=
              DATE_UTILS.HOUR_IN_MS / 2
            ) {
              w /= 2;
              x += w;
            } else {
              w -= 5;
              x += 5;
            }
          }
          last = evt;

          if (evt === event) {
            out.zIndex = ind;
            return false;
          }
          return true;
        });
      }

      out.left = `${x}px`;
      out.width = `${w}px`;
    } else {
      out.left = `${pos.x}px`;
      out.width = `${eventSizeRef.current.getBoundingClientRect().width}px`;
      out.zIndex = 999;
    }
    return out;
  };

  /*
   * EVENTS
   */
  const mouse_down = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (target.tagName === "TH" || target.className.indexOf("time") > -1) return;

    const rect = headerRef.current.getBoundingClientRect();
    if(e.clientY <= rect.y + rect.height) return;

    const from = date_from_pos(e.clientX, e.clientY);
    if (!from) return;
    setCurrentEvent({
      ...currentEvent,
      from,
      visible: false,
    } as SchedulerCurrentEvent);
  };

  const mouse_move = (e: MouseEvent): void => {
    if (!currentEvent || !currentEvent.from.getTime()) return;

    const to = date_from_pos(e.clientX, e.clientY);
    if (!to) return;

    if (to > currentEvent.from) {
      setCurrentEvent({
        ...currentEvent,
        from: currentEvent.from,
        to,
        visible: true,
      } as SchedulerCurrentEvent);
    } else if (to < currentEvent.from) {
      setCurrentEvent({
        ...currentEvent,
        from: to,
        to: currentEvent.from,
        visible: true,
      } as SchedulerCurrentEvent);
    } else {
      setCurrentEvent({
        ...currentEvent,
        from: currentEvent.from,
        to,
        visible: false,
      } as SchedulerCurrentEvent);
    }
  };

  const mouse_up = (e: MouseEvent): void => {
    if (!currentEvent || !currentEvent.from.getTime()) return;

    const tmp = {
      from: currentEvent.from,
      to: date_from_pos(e.clientX, e.clientY),
    };
    if (!tmp.to) return;

    if (!tmp.to || DATE_UTILS.compare_times(tmp.from, tmp.to)) {
      tmp.to = DATE_UTILS.walk_hour(currentEvent.from);
    }

    onRequestAdd({
      ...currentEvent,
      is_current: false,
    });
    setCurrentEvent(dummyCurrentEvent);
  };

  /*
   * RENDER
   */
  return (
    <div
      className="react-simple-scheduler"
      style={(style ?? {}).container ?? {}}
    >
      <div
        className="head"
        style={(style ?? {}).head ?? {}}
      >
        <button
          type="button"
          className="today"
          onClick={() => setSelected(DATE_UTILS.TODAY)}
        >
          Today
        </button>
        <button
          type="button"
          className="chevron"
          onClick={() => setSelected(DATE_UTILS.walk_day(selected, -7))}
        >
          <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg" transform="translate(0 4)">
            <line x1="7.35337" y1="0.353553" x2="0.353371" y2="7.35355" stroke="black" />
            <line x1="0.353569" y1="6.64645" x2="7.35357" y2="13.6464" stroke="black" />
          </svg>
        </button>
        <h1>
          <DateFormatter date={weekStart} fmt="W Y" />
        </h1>
        <button
          type="button"
          className="chevron flipped"
          onClick={() => setSelected(DATE_UTILS.walk_day(selected, 7))}
        >
          <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg" transform="translate(0 4)">
            <line x1="7.35337" y1="0.353553" x2="0.353371" y2="7.35355" stroke="black" />
            <line x1="0.353569" y1="6.64645" x2="7.35357" y2="13.6464" stroke="black" />
          </svg>
        </button>
        <div className="counterweight" />
      </div>

      <div
        ref={scrollRef}
        className={`body ${rerender}`}
        style={(style ?? {}).body ?? {}}
      >
        <table
          role="presentation"
          className="schedule"
          cellPadding={0}
          cellSpacing={0}
          onMouseDown={mouse_down as any}
          onMouseMove={mouse_move as any}
          onMouseUp={mouse_up as any}
        >
          <thead>
            <tr>
              <th ref={headerRef} className="time">&nbsp;</th>
              {DATE_UTILS.SHORT_DAYS_OF_WEEK.map((day, ind) => {
                const tmp = DATE_UTILS.walk_day(weekStart, ind);
                return (
                  <th
                    key={day}
                    className={DATE_UTILS.compare_dates(DATE_UTILS.TODAY, tmp) ? "today" : ""}
                  >
                    <div>{day}</div>
                    <div>{tmp.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[...Array(24).keys()].map((i) => (
              <tr key={i}>
                <td className="time">
                  {i > 0 ? <DateFormatter date={DATE_UTILS.set_hour(i)} fmt="h P" /> : ""}
                </td>
                <td ref={i === 0 ? eventSizeRef : null} />
                <td />
                <td />
                <td />
                <td />
                <td />
                <td />
              </tr>
            ))}
          </tbody>
        </table>
        <br />

        {
          events.map((evt) => (
            <div
              key={evt.to.getTime() + evt.from.getTime()}
              role="presentation"
              className="event"
              style={styles_from_event(evt)}
              onMouseDown={mouse_down as any}
              onMouseMove={mouse_move as any}
              onMouseUp={(e: any) => {
                if (currentEvent && currentEvent.visible) mouse_up(e);
                else {
                  setCurrentEvent(dummyCurrentEvent);
                  onRequestEdit(evt);
                }
              }}
            >
              <div className="time">
                <DateRangeFormatter from={evt.from} to={evt.to} />
              </div>
              <div className="title">{evt.name}</div>
            </div>
          ))
        }
        {
          (currentEvent && currentEvent.visible) ? (
            <div
              role="presentation"
              className="event current"
              style={styles_from_event(currentEvent)}
              onMouseDown={mouse_down as any}
              onMouseMove={mouse_move as any}
              onMouseUp={mouse_up as any}
            >
              <div className="time">
                <DateRangeFormatter from={currentEvent.from} to={currentEvent.to} />
              </div>
              <div className="title">(No title)</div>
            </div>
          ) : null
        }

        <div
          className="ticker"
          style={{
            display: DATE_UTILS.is_within_week(weekStart, DATE_UTILS.TODAY) ? "block" : "none",
            top: `${pos_from_date(new Date()).y}px`,
            left: `${pos_from_date(new Date()).x}px`,
            width: `${eventSizeRef.current ? eventSizeRef.current.getBoundingClientRect().width : 0}px`,
          }}
        >
          <div className="ball" />
          <div className="line" />
        </div>
      </div>
    </div>
  );
};

export default Scheduler;