import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, Scheduler } from "./dist/index.js";
import "./index.css";

/*
import axe from "@axe-core/react";
axe(React, ReactDOM, 1000);
*/

function App() {
  const [selected, setSelected] = useState(new Date());
  const [events, setEvents] = useState([]);

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
      role="main"
    >
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
          body: { height: "calc(100vh - 70px)", width: "calc(100vw - 200px)" }
        }}
      />
    </main>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
