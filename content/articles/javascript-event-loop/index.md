+++
title = "JavaScript Event Loop: The Definitive Edition"
date = "2023-03-08"
+++

_Note: We'll cover the event loop in context of browsers and not other runtimes like Node.js_

The event loop is a mechanism/algorithm/set of rules that specifies how asynchronous code is handled in JavaScript. This is important because JavaScript is single threaded, it can run one thing at a time. When the main thread is busy, we queue the pending events and these are run later when the main thread is available.

When we say JavaScript is single threaded, we are talking about the main UI thread where everything related to the UI is run. This includes user interaction handling, rendering, user scripts etc. The browser might be having more threads that it uses internally but our code is run in this main UI thread. There is [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) which can spawn new threads and our code can run in it, but it can't interact with the UI directly.

Historically, event loop was not part of the JavaScript specification, the host environments were free to implement it without any standard. The event loop standard was first specified in the [ES6 specification](https://262.ecma-international.org/6.0/#sec-jobs-and-job-queues). Before node 11 was released in 2019, the event loop behavior was different in node.js and the browsers. [^1]

When we try to run any JavaScript code, they might come to the event loop in the form of different type of tasks:
- macro task
- micro task
- requestAnimationFrame task
- nano task (this is only available in node.js, we won't talk about this, we are focused on browsers)

## Macro task
This is the most common type of task in the event loop.
This includes these but is not limited to:
- code running from a script tag
- callback in a timer
- callback run when a network request is finished using `XMLHttpRequest`
- collection of multiple handler callbacks in response to an event

### Timer macro task

Doing `setTimeout(cb, 0)` is the most common form of queueing a macro task in the macro task queue.

```js
setTimeout(() => {
  console.log('timeout');
}, 0);

console.log('script');
```

Firstly, this code itself is running as a macro task. To execute this code in the browser, we have to use a [script](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) which adds this code as a macro task in the macro task queue. The event loop then picks this up from the macro task queue.

The `setTimeout` function is called, the timer is started by the hosting environment. The timer is running in parallel to our main thread, when the timer will expire in the future it adds the callback with `console.log('timeout')` to the macro task queue.

Now back to the present, while the timer has started running in parallel, the main thread has other code to run like the `console.log('script')`. In JavaScript, a code once started is always [run to completion](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop#run-to-completion) before anything else can run, i.e. it cannot be interrupted in between for other task. The new task is instead queued in a task queue when it is ready to run on the main thread and runs when its turn comes.

When a macro task finishes, a task from the macro task queue is picked to run again to completion. If there were multiple macro tasks which were enqueued while the main thread was busy, we'll get the first macro task and others will wait in the queue.

The pseudocode for the event loop with macro task looks like this:

```js
function eventLoop() {
  const macroTaskQueue = [];

  while (true) {
    const macroTask = macroTaskQueue.shift();
    runToCompletion(macroTask);
  }
}
```

#### Quirk in using setTimeout for queueing macro task
A small detour before moving back to event loop. `setTimeout` has a strange behavior which is even listed in the HTML standard.

> Timers can be nested; after five such nested timers, however, the interval is forced to be at least four milliseconds.
> -- [HTML Standard](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)

Code snippet creating nested `setTimeout` calls with depth = 10.

```js
let depth = 1;
let previousTime = performance.now();
function recurse() {
  if (depth > 10) {
    return;
  }
  const nowTime = performance.now();
  console.log({ depth, time: nowTime - previousTime });
  previousTime = nowTime;
  depth += 1;
  setTimeout(recurse, 0);
}

setTimeout(recurse, 0);
```

The output of above snippet in Chrome `Version 110.0.5481.177 (Official Build) (arm64)` is

```
{depth: 1, time: 0.7999999970197678}
{depth: 2, time: 0.4000000059604645}
{depth: 3, time: 0.09999999403953552}
{depth: 4, time: 0.10000000149011612}
{depth: 5, time: 4.700000002980232}
{depth: 6, time: 4.799999997019768}
{depth: 7, time: 4.200000002980232}
{depth: 8, time: 4.799999997019768}
{depth: 9, time: 4.800000004470348}
{depth: 10, time: 5.799999997019768}
```

After 5 recursive nested calls, `setTimeout(cb, 0)` takes at least 4ms to put the callback to the macro task queue.

Because of this, `setTimeout` is not the most reliable way to queue a macro task to the macro task queue.

A better way is to use [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) to enqueue a macro task. [^2]

```js
function queueMacroTask(cb) {
  const mc = new MessageChannel();
  mc.port1.postMessage (null);
  mc.port2.addEventListener("message", () => {
    cb();
  }, {once: true});
  mc.port2.start();
}
```

Running the same code which we ran before with our `queueMacroTask`:

```js
let depth = 1;
let previousTime = performance.now();
function recurse() {
  if (depth > 10) {
    return;
  }
  const nowTime = performance.now();
  console.log({ depth, time: nowTime - previousTime });
  previousTime = nowTime;
  depth += 1;
  queueMacroTask(recurse);
}

queueMacroTask(recurse);
```

The result is:

```
{depth: 1, time: 0.4000000059604645}
{depth: 2, time: 0.5}
{depth: 3, time: 0.09999999403953552}
{depth: 4, time: 0.10000000149011612}
{depth: 5, time: 0.10000000149011612}
{depth: 6, time: 0.20000000298023224}
{depth: 7, time: 0.09999999403953552}
{depth: 8, time: 0.20000000298023224}
{depth: 9, time: 0.20000000298023224}
{depth: 10, time: 0.19999999552965164}
```
This is better than `setTimeout`, it doesn't have the 4ms quirk.

Now let's go back to the event loop.

### Event listener macro task

This covers the case of having multiple callbacks in a single macro task.

```html
<div id="outer">
  <div id="inner">Click me</div>
</div>
```

```js
const outer = document.getElementById('outer');
const inner = document.getElementById('inner');

function onClick() {
  console.log("click event", this.id);
}

inner.addEventListener("click", onClick);
outer.addEventListener("click", onClick);

console.log('script');
```

In this snippet we have two divs - `inner` div inside the `outer` div. Clicking on the text `Click me` enqueues a task which consists of two callbacks one for the `inner` div click event handler and other for the `outer` div click event handler because of [event bubbling](https://javascript.info/bubbling-and-capturing#bubbling).

This is important for future sections - __a single macro task can consist of multiple callbacks__. DOM has provided these multiple callbacks to this single macro task.

And this was a basic example, doing small DOM manipulation can cause a lot of callbacks to be triggered in production code.

Now, let's write the new updated event loop pseudocode keeping in mind that a single macro task can consist of multiple callbacks.

```js
function eventLoop() {
  const macroTaskQueue = [];

  while (true) {
    const macroTaskCallbacks = macroTaskQueue.shift();
    for (let i = 0; i < macrotaskCallbacks.length; ++i) {
      const macroTaskCallback = macroTaskCallbacks[i];
      runToCompletion(macroTaskCallback);
    }
  }
}
```

There's a special case[^3] that we should discuss. The snippet is similar to the previous one but here we call `click` in the program itself instead of clicking it manually by ourselves in real life.

```js
const outer = document.getElementById('outer');
const inner = document.getElementById('inner');

function onClick() {
  console.log("click event", this.id);
}

inner.addEventListener("click", onClick);
outer.addEventListener("click", onClick);

console.log('script');

inner.click();
```

When we programmatically call the `click` function, then there's no new macro task which will be queued to the macro task queue. We'll still be continuing the main `script` level macro task when running both `onClick` functions later on.

It'll be similar to this pseudo code:

```
inner.click = (e) => {
  onClick.call(inner, e);
  onClick.call(outer, e);
};
```

which keeps the `onClick` handlers in the same function call and not create new macro task callbacks.

Although, this new snippet outputs in the same sequence but will have different behavior when mixed with micro tasks.

## Micro tasks

Micro tasks were created to be used for [Mutation observer](https://javascript.info/mutation-observer).

JavaScript Promises use micro tasks. The Promise implementation was first done in the user land, there were a lot of libraries implementing Promise before [native Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) was available in the browsers. Library authors were in competition to create fast Promise library, so they started using micro tasks for implementing Promise.[^4]

Micro tasks are run when the current task callback has finished running to completion (the call stack is empty).

When the micro tasks start running, they exhaust the complete micro task queue. If in between a micro task, new micro tasks are queued then they are run till the micro task queue is empty.

```js
function addMicroTask() {
  Promise.resolve().then(() => {
    addMicroTask();
  });
}

addMicroTask();
```

The above code will block the main thread because the micro task will keep on increasing and the micro task queue will never end.

Let's check out a mix of macro task and micro task:

```js
setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('script');
```

The current macro task running is the main script which has the statement `console.log('script')`. When the first statement with `setTimeout` runs, it starts off the timer, which will add the callback to the macro task queue after 0 ms.

The `Promise.resolve()` statement resolves this promise immediately and adds the `console.log('promise')` callback to the micro task queue.

The statement with `console.log('script')` runs immediately and prints `'script'`. This ends the current `script` macro task. We then exhaust the micro task queue which prints `'promise'`, and then continue the event loop and get the next macro task which prints `'timeout'`.

Updated event loop pseudo code:

```js
function eventLoop() {
  const macroTaskQueue = [];
  const microTaskQueue = [];

  while (true) {
    const macroTaskCallbacks = macroTaskQueue.shift();
    for (let i = 0; i < macrotaskCallbacks.length; ++i) {
      const macroTaskCallback = macroTaskCallbacks[i];
      runToCompletion(macroTaskCallback);
      while (microTaskQueue.length !== 0) {
        const microTask = microTaskQueue.shift();
        runToCompletion(microTask);
      }
    }
  }
}
```

The important thing to note - __the micro task exhaustion starts after each callback of the macro task is finished__. Even if a macro task has multiple callbacks, then the micro task queue exhaustion starts with - when the first callback ends. It won't wait for all the callbacks of the current macro task to finish.

Refactoring the code by moving micro task exhaustion code to a function:

```js
function eventLoop() {
  const macroTaskQueue = [];
  const microTaskQueue = [];

  function exhaustMicroTaskQueue() {
    while (microTaskQueue.length !== 0) {
      const microTask = microTaskQueue.shift();
      runToCompletion(microTask);
    }
  }

  while (true) {
    const macroTaskCallbacks = macroTaskQueue.shift();
    for (let i = 0; i < macroTaskCallbacks.length; ++i) {
      const macroTaskCallback = macroTaskCallbacks[i];
      runToCompletion(macroTaskCallback);
      exhaustMicroTaskQueue()
    }
  }
}
```

Unlike macro tasks which do not provide a direct way to enqueue a task to the macro task queue, micro tasks have a function [queueMicroTask](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask) which can be used to directly enqueue a callback to the micro task queue.

Now, back to the special case that we talked about earlier in macro task section. Let's add a Promise to mix macro and micro tasks:

```js
const outer = document.getElementById('outer');
const inner = document.getElementById('inner');

function onClick() {
  console.log("click event", this.id);
  
  Promise.resolve().then(() => {
    console.log("resolved", this.id);
  });
}

inner.addEventListener("click", onClick);
outer.addEventListener("click", onClick);

console.log('script');

inner.click();
```

The result of this code is:
```
script
click event inner
click event outer
resolved inner
resolver outer
```

Because there was no new macro task, the script macro task continued and the `onClick` functions were called on the top of the running stack. Because the original script macro task callback was not finished, the micro task exhaustion does not start and we see the `resolved x` logs at the end when the original script macro task finishes after both `onClick` handlers are called.

Removing `inner.click` and manually clicking the inner div instead generates this output:
```
script
click event inner
resolved inner
click event outer
resolved outer
```

After logging `script`, the main script macro task ends. The new macro task has 2 callbacks: first for inner `onClick`, second for outer `onClick`. Now, at the end of the first callback we exhaust the micro task queue. And then after running the second callback, we exhaust the micro task queue again.

## Rendering

Rendering is a part of the event loop [^5]. Rendering happens at the end of the current event loop iteration (each event loop iteration is also known as a tick of the event loop). And it happens only when required i.e. when it is time to render a new frame - after an interval of ~16 ms for a 60 hertz display. Although, __the browser might have to skip rendering of some frames if the phases before rendering took a lot of time__.

```js
function eventLoop() {
  // ...

  while (true) {
    const macroTaskCallbacks = macroTaskQueue.shift();
    for (let i = 0; i < macroTaskCallbacks.length; ++i) {
      const macroTaskCallback = macroTaskCallbacks[i];
      runToCompletion(macroTaskCallback);
      exhaustMicroTaskQueue()
    }

    if (isItTimeForNextFrameRender()) {
      render();
    }
  }
}
```

If we want to run something just before the rendering of a frame happens - we can use [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame). If we call `requestAnimationFrame` multiple times before the frame is rendered then all the callbacks passed are enqueued in a queue and these all are run before the frame renders.

```js
function eventLoop() {
  // ...
  const rAFQueue = [];
  while (true) {
    // ...
    
    if (isItTimeForNextFrameRender()) {
      for (let i = 0; i < rAFQueue.length; ++i) {
        const rAFTask = rAFQueue[i];
        runToCompletion(rAFTask);
      }

      render();
    }
  }
}
```

The important thing to note is - __the new rAF callbacks queued are not run in this tick__ (because we only looped over the current tasks and are not using the new ones). The new ones are queued for the next time when we need to render the next frame.

Let's take a look at this set of code snippets:
```html
<div id="button">Click me</div>
```

```js
function onClick() {
  document.body.style.backgroundColor = "red";
  document.body.style.backgroundColor = "blue";
}

document.getElementById('button')
  .addEventListener('click', onClick);
```

After clicking, what will happen? Will we see both red and blue background color in sequence or just the blue background? We can now answer this question using the event loop.

The current code is running as a macro task via a script tag. Now, on click - a new macro task is pushed which is the onClick function. This onClick function runs to completion and only then we go to the rendering phase. In the end the last value of backgroundColor - blue is used to render the page.

What if we wanted to first render the page with red color and then with blue in the next frame. Would using a `requestAnimationFrame` help. Will this work?:

```js
function onClick() {
  document.body.style.backgroundColor = "red";
  requestAnimationFrame(() => {
    document.body.style.backgroundColor = "blue";
  });
}
```

This still won't work because we know that the `requestAnimationFrame` callbacks are run before rendering. The render phase will get the backgroundColor = blue.

We can use 2 nested `requestAnimationFrame` callbacks to solve this. Now just before rendering the second frame we'll set the backgroundColor to blue. Which creates the effect that we want.

```js
function onClick() {
  document.body.style.backgroundColor = "red";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.backgroundColor = "blue";
    });
  });
}
```

Next important thing is - __micro task can also run between these `requestAnimationFrame` callbacks for the current frame similar to multiple callbacks in a macro task__.

```js
function eventLoop() {
  // ...
  const rAFQueue = [];
  while (true) {
    // ...
    
    if (isItTimeForNextFrameRender()) {
      for (let i = 0; i < rAFQueue.length; ++i) {
        const rAFTask = rAFQueue[i];
        runToCompletion(rAFTask);
        exhaustMicroTaskQueue();
      }

      render();
    }
  }
}
```

## Final event loop code
This is the final event loop code which can be used to reason about any code that you see in your JavaScript code in the browser environments.

```js
function eventLoop() {
  const macroTaskQueue = [];
  const microTaskQueue = [];
  const rAFQueue = [];
  
  function exhaustMicroTaskQueue() {
    while (microTaskQueue.length !== 0) {
      const microTask = microTaskQueue.shift();
      runToCompletion(microTask);
    }
  }
  
  while (true) {
    const macroTaskCallbacks = macroTaskQueue.shift();
    for (let i = 0; i < macroTaskCallbacks.length; ++i) {
      const macroTaskCallback = macroTaskCallbacks[i];
      runToCompletion(macroTaskCallback);
      exhaustMicroTaskQueue();
    }

    if (isItTimeForNextFrameRender()) {
      for (let i = 0; i < rAFQueue.length; ++i) {
        const rAFTask = rAFQueue[i];
        runToCompletion(rAFTask);
        exhaustMicroTaskQueue();
      }

      render();
    }
  }
}
```

[^1]: https://blog.insiderattack.net/new-changes-to-timers-and-microtasks-from-node-v11-0-0-and-above-68d112743eb3
[^2]: https://youtu.be/8eHInw9_U8k?t=495
[^3]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/#level-1-bosss-angry-older-brother
[^4]: https://stackoverflow.com/questions/66190571/what-was-the-motivation-for-introducing-a-separate-microtask-queue-which-the-eve#answer-66386291
[^5]: https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering
