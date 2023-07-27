+++
title = "Understanding Solid: Reactivity Basics"
date = "2019-10-10"
+++

# Understanding Solid: Reactivity Basics

[Solid](https://github.com/ryansolid/solid) is a Reactive library for creating user interfaces. Solid updates the DOM only where it is required, without using Virtual DOM. Solid is [fast](https://krausest.github.io/js-framework-benchmark/current.html).

To understand Solid, first we have to understand its Reactive ideology.

Let’s take an example of a simple auto updating counter to show how the code looks like and explain how it works under the hood.

First a counter without a UI: [Solid Counter - CodeSandbox](https://codesandbox.io/s/solid-counter-qsjju)

```js
import { createState, createEffect } from 'solid-js';

const [state, setState] = createState({ count: 0 });

setInterval(() => {
  setState({ count: state.count + 1 });
}, 1000);

createEffect(() => {
  console.log(state.count);
});
```

This code looks too much similar to React hooks and it is actually inspired from React hooks. But there is a major difference, contrary to React, this code will not run again and again top to down like in a React component. Instead we have code blocks which are run whenever their dependencies are updated.

## createEffect
Whenever the value of  `state.count` is updated the code block passed to `createEffect` is called which in turn will call `console.log` every 1 second.

```
0
1
2
3
4
...
```

How does `createEffect` knows when to call this function whenever `state.count` changes ?

The answer lies in Javascript [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

The state returned by createState is actually a proxy object, it has setter and getter traps for all properties on the original object.

Whenever a value is updated on this object, the setter is called. And whenever a value is accessed, the getter is called.

Let’s try to have a feel with some rough pseudocode:

```js
let activeBlock;

// not real code, rough estimation
state.count = {
  _blocks: [],
  getter() {
    if (activeBlock) {
      this._blocks.push(activeBlock);
    }
    ...
  }
  setter() {
    if (this._blocks.length) {
      this._blocks.forEach(block => block());
    }
    ...
  }
}

function createEffect(f) {
  activeBlock = f;
  f();
  activeBlock = undefined;
}

...

createEffect(() => {
  console.log(state.count);
});
```

Let’s call the function passed to createEffect as `f`.

When we call createEffect, first we save `f` in `activeBlock` variable and then run `f`. Then whenever a getter is hit, we save `activeBlock` with the current property so that the dependent blocks can be run, when there is a hit to its setter.

In our counter example, `f` is the block with `console.log(state.count)` in it. For the first time when `createEffect` calls `f`, it saves `f` in `activeBlock` variable. Then it runs `f`.

Now when `f` runs, it encounters `state.count` and its getter is executed. Then `f` is pushed to `this._blocks`.

If we also had some other block with `state.count`, its reference would also be pushed in the `this._blocks` array.

```js
createEffect(() => {
  console.log('2 x Counter = ', state.count * 2);
});
```

If in the future `state.count` is updated, its setter will be triggered and it will execute all its saved blocks.

In this way we do not need to explicitly define what we have to track, and the blocks would be run whenever anything in the block changes.

## setState instead of setter
Solid emphasizes uni-directional data flow like React. So instead of directly updating the value of state, `setState` must be used to trigger the setter.

## Reactive html element with solid

Now that we know the basics of `createEffect` and how its works, let's use `createEffect` to update an HTML element.

Counter with a UI element: [Solid Counter - CodeSandbox](https://codesandbox.io/s/solid-counter-kpjok)

```js
const [state, setState] = createState({ count: 0 });

setInterval(() => {
  setState({ count: state.count + 1 });
}, 1000);

const el = document.createElement('div');

document.body.appendChild(el);

createEffect(() => {
  el.innerText = state.count;
});
```

So we are using createEffect to update the DOM text.

Similarly we can update className, style and other attributes reactively:

#### className
```js
createEffect(() => {
  el.className = state.count % 2 === 0 ? "even" : "odd";
});
```

#### style
we are using Object.assign because `=` does not work with style attribute.
```js
createEffect(() => {
  Object.assign(
    el.style,
    { color: state.count % 2 === 0 ? "black" : "white" }
  );
});
```

#### data-*
```js
createEffect(() => {
  el.setAttribute(
    "data-test", 
    state.count % 2 === 0 ? "even" : "odd"
  );
});
```

These were the basic reactive ideas needed to understand how solid works under the hood. Next post will cover `jsx` in solid.

---

This is the first blog post of series: `Understanding Solid`.

Next post https://atfzl.com/understanding-solid-jsx
