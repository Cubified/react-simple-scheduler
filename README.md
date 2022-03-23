# react-simple-scheduler

![demo.png](https://github.com/cubified/react-simple-scheduler/blob/main/demo/demo.png)

[Try it now!](https://cubified.github.io/react-simple-scheduler/demo/build)

Simple, extensible scheduler and calendar components for React, modeled after Google Calendar.

Aims to provide components that are not over-opinionated, which in this case means they:
 - Work with native JS `Date` objects
 - Are entirely self-contained, each fitting cleanly into unstyled `<div>`s
 - Are dependency-free other than React itself
 - Expose a simple interface for working with the components' data

## Installation and Usage

NOTE: This module is not yet published, it is coming soon.

To install, run:

     $ npm install --save-dev @cubified/react-simple-scheduler

     # Or:
     $ yarn add --dev @cubified/react-simple-scheduler

Minimal usage is as follows:

```jsx
import React, { useState } from "react";
import { Calendar, Scheduler } from "@cubified/react-simple-scheduler";

function App(){
  const [selected, setSelected] = useState(new Date());
  const [events, setEvents] = useState([]);

  return (
    <>
      <Calendar
        selected={selected}
        setSelected={setSelected}
      />
      <Scheduler
        events={events}
        selected={selected}
        setSelected={setSelected}
        onRequestAdd={(evt) => alert("Add element requested")}
        onRequestEdit={(evt) => alert("Edit element requested")}
      />
    </>
  );
}
```

This is relatively similar to what is contained in the [demo](https://github.com/cubified/react-simple-scheduler/blob/main/demo).

## Setting up and Compiling for Development

First, install dependencies with:

     $ npm

     # Or:
     $ yarn

Next, build the library with:

     $ npm run rollup

     # Or:
     $ yarn run rollup

This will create a CommonJS module in `dist/cjs`, and an ES module in `dist/esm`.

To start the demo application, run:

     $ cd demo

     $ npm run start

     # Or:
     $ yarn run start
