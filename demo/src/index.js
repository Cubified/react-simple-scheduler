import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, Scheduler } from "./dist/esm/index.m.js";
import "./index.css";

function App() {
  const [selected, setSelected] = useState(new Date());
  const [events, setEvents] = useState([]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
    }}>
      <Calendar
        selected={selected}
        setSelected={setSelected}
        style={{container: {padding: "12px"}}}
      />
      <Scheduler
        events={events}
        selected={selected}
        setSelected={setSelected}
        onRequestAdd={(cur) => {
          const tmp = events.slice();
          tmp.push({
            ...cur,
            name: "New event",
            style: {
              filter: `hue-rotate(${(events.length + 1) * 40}deg)`,
            }
          });
          setEvents(tmp);
        }}
        onRequestEdit={(evt) => {
          alert(`You clicked an event from ${evt.from.toLocaleDateString()} @ ${evt.from.toLocaleTimeString()} until ${evt.to.toLocaleDateString()} @ ${evt.to.toLocaleTimeString()}`);
        }}
        style={{
          container: { width: "calc(100vw - 200px)" },
          head: { width: "calc(100vw - 200px)" },
          body: { height: "calc(100vh - 70px", width: "calc(100vw - 200px)" }
        }}
      />
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
