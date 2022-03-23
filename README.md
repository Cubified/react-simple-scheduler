# react-simple-scheduler

| Demo |
| --- |
| ![demo.png](https://github.com/cubified/react-simple-scheduler/blob/main/demo/demo.png) |
| [Try it now!](https://cubified.github.io/react-simple-scheduler/demo/build) |

Simple, extensible scheduler and calendar components for React, modeled after Google Calendar.

## Features

 - Unobtrusive and unopinionated components -- very simple and easy to drop into an existing project
 - Works with native JS `Date` objects
 - Entirely self-contained, each fitting cleanly into unstyled `<div>`s
 - Dependency-free other than React itself
 - Exposes a simple interface for working with the components' data

 - Provides a month-by-month calendar view component
    - Fully customizable either by class names or `style` prop
 - Provides a week-by-week scheduler component
    - Automatically resizes overlapping events to best fit the screen
    - Supports click-and-drag event creation
    - Responsive, fitting comfortably in a desktop window
    - Fully customizable either by class names or `style` prop

## Installation and Usage

To install, run:

     $ npm install --save @cubified/react-simple-scheduler
     # Or:
     $ yarn add @cubified/react-simple-scheduler

## Example

Minimal usage of both modules is as follows:

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
        onRequestAdd={(evt) => {
          const tmp = events.slice();
          tmp.push(evt);
          setEvents(tmp);
        }}
        onRequestEdit={(evt) => alert("Edit element requested")}
      />
    </>
  );
}
```

This is relatively similar to what is contained in the [demo](https://github.com/cubified/react-simple-scheduler/blob/main/demo).

## Detailed API Information

### Calendar: Props

#### **selected**

The currently-selected date.

 - Type: `Date`
 - Required: Yes

#### **setSelected**

The React function to change the value of `selected`.

 - Type: `(val: Date) => void`
 - Required: Yes

#### **style**

The style objects to be passed to the calendar's elements.

 - Type:
```ts
{
  container: React.CSSProperties; // Refers to a <div> with className="react-simple-calendar"
  head: React.CSSProperties;      // Refers to a <div> with className="head"
  body: React.CSSProperties;      // Refers to a <table> with className="body"
}
```

 - Required: No

### Scheduler: Props

#### **events**

The array of events to be drawn on the scheduler.

 - Type: `Array<SchedulerExistingEvent>`
```ts
interface SchedulerExistingEvent {
  from: Date;
  to: Date;
  name: string;
  calendar: { name: string; enabled: boolean; }
  style?: React.CSSProperties
}
```

 - Required: Yes

#### **selected**

The currently-selected date.

 - Type: `Date`
 - Required: Yes

#### **setSelected**

The React function to change the value of `selected`.

 - Type: `(val: Date) => void`
 - Required: Yes

#### **onRequestAdd**

The function called when the user requests a new event be created.

 - Type: `(evt: SchedulerEvent) => void`
 - Required: Yes
 - Note: The scheduler does **not** automatically add the new event to the `events` array.

#### **onRequestEdit**

The function called when the user clicks on an existing event.

 - Type: `(evt: SchedulerEvent) => void`
 - Required: Yes

#### **editable**

Whether click-and-drag event creation is enabled.

 - Type: `boolean`
 - Required: No
 - Default: `true`

#### **style**

The style objects to be passed to the calendar's elements.

 - Type:
```ts
{
  container: React.CSSProperties; // Refers to a <div> with className="react-simple-scheduler"
  head: React.CSSProperties;      // Refers to a <div> with className="head"
  body: React.CSSProperties;      // Refers to a <div> with className="body"
}
```

 - Required: No

---

### Calendar: Styling

Note: [`Calendar.scss`](https://github.com/Cubified/react-simple-scheduler/blob/main/src/components/Calendar/Calendar.scss) provides the default styles, and is written to be as minimal and readable as possible.

#### **.react-simple-calendar**

The main calendar container, containing all visible elements.

#### **.react-simple-calendar .head**

The header containing the month name and forward/back buttons.

#### **.react-simple-calendar .body**

The main body of the calendar, containing day buttons.

#### **.react-simple-calendar .body td**

An individual day in the calendar. Has the class `.selected` when it is clicked, and `.today` when it is the current date.

### Scheduler: Styling

Note: [`Scheduler.scss`](https://github.com/Cubified/react-simple-scheduler/blob/main/src/components/Scheduler/Scheduler.scss) provides the default styles, and is written to be as minimal and readable as possible.

#### **.react-simple-scheduler**

The main scheduler container, containing all visible elements.

#### **.react-simple-scheduler .head**

The header containing the month name, forward/back buttons, and "Today" button.

#### **.react-simple-scheduler .body**

The main body of the calendar, containing the table and added elements.

#### **.react-simple-scheduler .body .schedule**

The table containing hour-by-hour blocks.  Stores little information/style on its own, but the size of `<td>`s within it are used to compute the positions of added elements.

#### **.react-simple-scheduler .body .event**

An added event in the scheduler.  If it is currently being created (i.e. click-and-dragged), it has the `.current` class as well.

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
