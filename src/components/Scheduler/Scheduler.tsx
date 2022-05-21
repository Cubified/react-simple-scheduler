import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import DATE_UTILS from "../../date";
import process_events from "../../process";
import { DateFormatter, DateRangeFormatter } from "../DateFormatter";
import {
  EventRepetition,
  DateRange,
  SchedulerRectangle,
  SchedulerCalendar,
  SchedulerEvent,
  SchedulerCurrentEvent,
  SchedulerExistingEvent,
  SchedulerStyles,
  SchedulerProps,
  TickerProps,
  EventProps
} from "../../types";
import "./Scheduler.scss";

/**
 * Style and formatting utilities, stateless
 *   therefore redefining them on rerender is
 *   a waste
 */
function date_from_pos(
  x: number,
  y: number,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>,
  weekStart: Date
) {
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

function pos_from_date(
  date: Date,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>,
  headerRef: React.MutableRefObject<HTMLTableHeaderCellElement>
) {
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

function styles_from_event(
  event: SchedulerEvent,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>,
  headerRef: React.MutableRefObject<HTMLTableHeaderCellElement>,
  processedEvents: Array<SchedulerExistingEvent>
): React.CSSProperties {
  let { from, to, style, is_current }: SchedulerEvent = event;

  const is_enabled = (evt: SchedulerEvent) =>
    (Array.isArray(evt.calendar) ? evt.calendar : [evt.calendar])
      .some((cal: SchedulerCalendar) => {
        if (typeof cal.enabled === "boolean") return cal.enabled;
        return cal.enabled();
      });

  if (!from || !to) return {};
  if (!is_enabled(event) && !is_current) {
    return {
      display: "none",
    };
  }

  if (from > to) {
    let tmp = from;
    from = to;
    to = tmp;
  }

  const rect = (eventSizeRef.current ?? {
    getBoundingClientRect: () => ({
      width: window.innerWidth * 0.1,
      height: window.innerHeight * 0.1,
    })
  }).getBoundingClientRect()

  const pos = pos_from_date(from, eventSizeRef, headerRef);
  const dif = DATE_UTILS.difference(to, from);
  if (dif === 0) return {};

  const out: React.CSSProperties = {
    top: `${pos.y}px`,
    height: `${Math.floor(
      (dif / DATE_UTILS.HOUR_IN_MS) * rect.height
    )}px`,
    ...((typeof style === "function" ? style(event) : style) ?? {}),
  };

  if (!is_current) {
    // Compute overlapping elements to determine element width
    //   (Logic mostly copied from observations about Google Calendar,
    //   with a few tweaks)
    const overlaps: Array<SchedulerExistingEvent> = [];
    let x: number = pos.x;
    let w: number = 0.95 * rect.width;
    processedEvents.forEach((evt) => {
      if (is_enabled(evt) && DATE_UTILS.dates_overlap_exclusive(evt as DateRange, { from, to })) {
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
    out.width = `${rect.width}px`;
    out.zIndex = 99;
  }
  return out;
}

/**
 * Pointer events, isolated for the same
 *   reason as above
 */
function mouse_down(
  e: MouseEvent,
  editable: boolean | undefined,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>,
  headerRef: React.MutableRefObject<HTMLTableHeaderCellElement>,
  weekStart: Date,
  currentEvent: SchedulerCurrentEvent,
  setCurrentEvent: (val: SchedulerCurrentEvent) => void
): void {
  if(editable === false) return;

  const target = e.target as HTMLElement;
  if (target.tagName === "TH" || target.className.indexOf("time") > -1) return;

  const rect = headerRef.current.getBoundingClientRect();
  if(e.clientY <= rect.y + rect.height) return;

  const from = date_from_pos(e.clientX, e.clientY, eventSizeRef, weekStart);
  if (!from) return;
  setCurrentEvent({
    ...currentEvent,
    from,
    visible: false,
  } as SchedulerCurrentEvent);
};

function mouse_move (
  e: MouseEvent,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>,
  weekStart: Date,
  currentEvent: SchedulerCurrentEvent,
  setCurrentEvent: (val: SchedulerCurrentEvent) => void,
): void {
  if (!currentEvent || !currentEvent.from.getTime()) return;

  const to = date_from_pos(e.clientX, e.clientY, eventSizeRef, weekStart);
  if (!to) return;

  if (to !== currentEvent.from) {
    if (currentEvent.from.getDate() !== to.getDate()) {
      const from = DATE_UTILS.copy_time(new Date(to), currentEvent.from);
      if (currentEvent.from.getTime() !== from.getTime()) {
        setCurrentEvent({
          ...currentEvent,
          from,
          to,
          visible: true,
        } as SchedulerCurrentEvent);
      }
    } else if (currentEvent.to.getTime() !== to.getTime()){
      setCurrentEvent({
        ...currentEvent,
        from: currentEvent.from,
        to,
        visible: true,
      } as SchedulerCurrentEvent);
    }
  } else {
    setCurrentEvent({
      ...currentEvent,
      from: currentEvent.from,
      to,
      visible: false,
    } as SchedulerCurrentEvent);
  }
};

function mouse_up(
  e: MouseEvent,
  eventSizeRef: React.MutableRefObject<HTMLTableDataCellElement>,
  weekStart: Date,
  currentEvent: SchedulerCurrentEvent,
  dummyCurrentEvent: SchedulerCurrentEvent,
  setCurrentEvent: (val: SchedulerCurrentEvent) => void,
  onRequestAdd: (val: SchedulerEvent) => void
): void {
  if (!currentEvent || !currentEvent.from.getTime()) return;

  const tmp = {
    from: currentEvent.from,
    to: date_from_pos(e.clientX, e.clientY, eventSizeRef, weekStart),
  };
  if (!tmp.to) return;

  if (!tmp.to || DATE_UTILS.compare_times(tmp.from, tmp.to)) {
    tmp.to = DATE_UTILS.walk_hour(currentEvent.from);
  }

  if(tmp.from > tmp.to){
    let d = tmp.from;
    tmp.from = tmp.to;
    tmp.to = d;
  }

  onRequestAdd({
    from: tmp.from,
    to: tmp.to,
    calendar: currentEvent.calendar,
    is_current: false,
    repeat: EventRepetition.None,
  } as SchedulerEvent);
  setCurrentEvent(dummyCurrentEvent);
};

/**
 * Memoized components
 */
const Ticker_unmemoized = ({
  weekStart,
  eventSizeRef,
  headerRef
}: TickerProps) => {
  return (
    <div
      className="ticker"
      style={{
        display: DATE_UTILS.is_within_week(weekStart, DATE_UTILS.TODAY) ? "block" : "none",
        ...(() => {
          const out = pos_from_date(DATE_UTILS.TODAY, eventSizeRef, headerRef);
          return {
            top: `${out.y}px`,
            left: `${out.x}px`,
          };
        })(),
        width: `${eventSizeRef.current ? eventSizeRef.current.getBoundingClientRect().width : 0}px`,
      }}
    >
      <div className="ball" />
      <div className="line" />
    </div>
  );
};
const Ticker = React.memo(
  Ticker_unmemoized,
  (prev: TickerProps, next: TickerProps): boolean => {
    const ev_prev = prev.eventSizeRef.current.getBoundingClientRect();
    const ev_next = next.eventSizeRef.current.getBoundingClientRect();

    const head_prev = prev.headerRef.current.getBoundingClientRect();
    const head_next = next.headerRef.current.getBoundingClientRect();

    return (
      (prev.weekStart.getTime() === next.weekStart.getTime()) &&
      (JSON.stringify(ev_prev) === JSON.stringify(ev_next)) &&
      (JSON.stringify(head_prev) === JSON.stringify(head_next)) &&
      (prev.hasResized === next.hasResized)
    );
  }
);

const Events_unmemoized = ({
  processedEvents,
  weekStart,
  eventSizeRef,
  headerRef,
  currentEvent,
  setCurrentEvent,
  dummyCurrentEvent,

  editable,
  onRequestAdd,
  onRequestEdit
}: EventProps) => {
  return (<>
    {
      processedEvents
        .filter((evt) => DATE_UTILS.is_within_week(weekStart, evt.from))
        .map((evt) => (
          <div
            key={evt.to.getTime() + evt.from.getTime() + evt.name}
            role="presentation"
            className="event"
            style={styles_from_event(evt, eventSizeRef, headerRef, processedEvents)}
            onMouseDown={((e: MouseEvent) =>
              mouse_down(e, editable, eventSizeRef, headerRef, weekStart, currentEvent, setCurrentEvent)) as any
            }
            onMouseMove={((e: MouseEvent) =>
              mouse_move(e, eventSizeRef, weekStart, currentEvent, setCurrentEvent)) as any
            }
            onMouseUp={(e: any) => {
              if (currentEvent &&
                  currentEvent.visible &&
                  !DATE_UTILS.compare_times(currentEvent.from, currentEvent.to)) {
                mouse_up(
                  e,
                  eventSizeRef,
                  weekStart,
                  currentEvent,
                  dummyCurrentEvent,
                  setCurrentEvent,
                  onRequestAdd
                );
              } else {
                setCurrentEvent(dummyCurrentEvent);
                onRequestEdit(evt);
              }
            }}
            aria-label={`Event with title ${evt.name}`}
          >
            <div className="time">
              <DateRangeFormatter from={evt.from} to={evt.to} />
            </div>
            <div className="title">{evt.name}</div>
          </div>
        )
      )
    }
    {
      (currentEvent && currentEvent.visible) ? (
        <div
          role="presentation"
          className="event current"
          style={styles_from_event(currentEvent, eventSizeRef, headerRef, processedEvents)}
          onMouseDown={((e: MouseEvent) =>
            mouse_down(e, editable, eventSizeRef, headerRef, weekStart, currentEvent, setCurrentEvent)) as any
          }
          onMouseMove={((e: MouseEvent) =>
            mouse_move(e, eventSizeRef, weekStart, currentEvent, setCurrentEvent)) as any
          }
          onMouseUp={((e: MouseEvent) =>
            mouse_up(e, eventSizeRef, weekStart, currentEvent, dummyCurrentEvent, setCurrentEvent, onRequestAdd)) as any
          }
        >
          <div className="time">
            <DateRangeFormatter from={currentEvent.from} to={currentEvent.to} />
          </div>
          <div className="title">(No title)</div>
        </div>
      ) : null
    }
  </>);
};
const Events = React.memo(
  Events_unmemoized,
  (prev: EventProps, next: EventProps): boolean => {
    const ev_prev = prev.eventSizeRef.current.getBoundingClientRect();
    const ev_next = next.eventSizeRef.current.getBoundingClientRect();

    const head_prev = prev.headerRef.current.getBoundingClientRect();
    const head_next = next.headerRef.current.getBoundingClientRect();

    return ((
      (prev.processedEvents.length === next.processedEvents.length) &&
      (prev.weekStart.getTime() === next.weekStart.getTime()) &&
      (JSON.stringify(ev_prev) === JSON.stringify(ev_next)) &&
      (JSON.stringify(head_prev) === JSON.stringify(head_next)) &&
      (prev.currentEvent.from.getTime() === next.currentEvent.from.getTime()) &&
      (prev.currentEvent.to.getTime() === next.currentEvent.to.getTime()) &&
      (prev.currentEvent.visible === next.currentEvent.visible) &&
      (prev.hasResized === next.hasResized)
    ));
  }
);

/**
 * Main scheduler/timetable view
 */
const Scheduler = ({
  events,

  selected,
  setSelected,

  onRequestAdd,
  onRequestEdit,

  editable,
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

  const style_fixed: SchedulerStyles = {
    container: (style ?? {}).container ?? {},
    head: (style ?? {}).head ?? {},
    body: (style ?? {}).body ?? {},
  };

  /*
   * STATE and REFS
   */
  const [currentEvent, setCurrentEvent] = useState<SchedulerCurrentEvent>(dummyCurrentEvent);
  const [weekStart, setWeekStart] = useState(DATE_UTILS.first_of_week(selected));
  const processedEvents = useMemo(() => process_events(events, weekStart), [events, weekStart]);
  const [hasResized, setHasResized] = useState<number>(0);

  const scrollRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const eventSizeRef = useRef() as React.MutableRefObject<HTMLTableDataCellElement>;
  const headerRef = useRef() as React.MutableRefObject<HTMLTableHeaderCellElement>;

  /*
   * HOOKS and CALLBACKS
   */
  useEffect(() => {
    if(!scrollRef.current) return;
    if (!eventSizeRef.current) return;

    scrollRef.current.scrollTo(0, (eventSizeRef.current.offsetHeight * 8) - 25);

    function resize(){
      setHasResized(Math.random());
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => setWeekStart(DATE_UTILS.first_of_week(selected)), [selected]);

  /*
   * RENDER
   */
  return (
    <div
      className="react-simple-scheduler"
      style={style_fixed.container}
      role="complementary"
      aria-label="Calendar"
    >
      <div
        className="head"
        style={style_fixed.head}
      >
        <button
          type="button"
          className="today"
          onClick={() => setSelected(DATE_UTILS.TODAY)}
          aria-label="View current week"
        >
          Today
        </button>
        <button
          type="button"
          className="chevron"
          onClick={() => setSelected(DATE_UTILS.walk_day(selected, -7))}
          aria-label="View previous week"
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
          aria-label="View next week"
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
        className="body"
        style={style_fixed.body}
        tabIndex={0}
      >
        <table
          role="presentation"
          className="schedule"
          cellPadding={0}
          cellSpacing={0}
          onMouseDown={((e: MouseEvent) =>
            mouse_down(e, editable, eventSizeRef, headerRef, weekStart, currentEvent, setCurrentEvent)) as any
          }
          onMouseMove={((e: MouseEvent) =>
            mouse_move(e, eventSizeRef, weekStart, currentEvent, setCurrentEvent)) as any
          }
          onMouseUp={((e: MouseEvent) =>
            mouse_up(e, eventSizeRef, weekStart, currentEvent, dummyCurrentEvent, setCurrentEvent, onRequestAdd)) as any
          }
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

        <Events
          processedEvents={processedEvents}
          weekStart={weekStart}
          eventSizeRef={eventSizeRef}
          headerRef={headerRef}
          currentEvent={currentEvent}
          setCurrentEvent={setCurrentEvent}
          dummyCurrentEvent={dummyCurrentEvent}

          editable={editable}
          onRequestAdd={onRequestAdd}
          onRequestEdit={onRequestEdit}
          hasResized={hasResized}
        />

        <Ticker
          weekStart={weekStart}
          eventSizeRef={eventSizeRef}
          headerRef={headerRef}
          hasResized={hasResized}
        />
      </div>
    </div>
  );
};

export default Scheduler;
