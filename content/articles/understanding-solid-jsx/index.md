+++
title = "Understanding Solid: JSX"
date = "2019-11-25"
+++

[Solid](https://github.com/ryansolid/solid) uses [JSX](https://facebook.github.io/jsx/) to render vanilla DOM elements. In React the `<div />` compiles to `React.createElement('div')` but in Solid you could say it compiles to `document.createElement('div')` (actually it uses HTML templates, more on this ahead).

## Hello World component:

```js
function HelloWorld() {
  return (
    <div>
      Hello World
    </div>
  );
}
```

This will (conceptually) compile to:
```js
function HelloWorld() {
  const el$ = document.createElement('div');
  
  el$.innerText = 'Hello World';
  
  return el$;
}
```


Actually solid uses [HTML template element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) because it is more performant for creating new instances from same template.

So it actually compiles to this:
```js
function _$template(str) {
  const t = document.createElement('template');
  t.innerHTML = str;
  return t.content.firstChild;
}

const _tmpl$ = _$template(`<div>Hello World</div>`);

function HelloWorld() {
  return _tmpl$.cloneNode(true);
}
```

From the previous [post](https://www.atfzl.com/understanding-solid-reactivity-basics) we know how solid is tracking dependencies. We'll use it here now by creating a counter.

```js
function Counter() {
  const [state, setState] = createState({ counter: 0 });
  
  setInterval(() => {
    setState({ counter: state.counter + 1 });
  });
  
  return (
    <div>
      {state.counter}
    </div>
  );
}
```

This will compile to:
```js
const _tmpl$ = _$template(`<div></div>`);

function Counter() {
  const [state, setState] = createState({
    counter: 0
  });
  setInterval(() => {
    setState({
      counter: state.counter + 1
    });
  });
  return function () {
    const _el$ = _tmpl$.cloneNode(true);

    createEffect(() => {
      _el$.innerText = state.counter;
    });

    return _el$;
  }(); // NOTE: this is an iife!
}
```

Note that the string passed to `_$template` does not have the part where we had the dynamic value `{state.counter}`. It will be added later in `createEffect`.

Now whenever we update the counter, the createEffect block runs which updates the innerText of `_el$`.

## JSX with nesting:
```js
function Counter() {
  const [state, setState] = createState({ counter: 0 });
  
  setInterval(() => {
    setState({ counter: state.counter + 1 });
  });
  
  return (
    <div>
      <div>Counter:</div>
      <div>{state.counter}</div>
    </div>
  );
}
```

Compiles to:
```js
const _tmpl$ = _$template(`<div><div>Counter:</div><div></div></div>`);

function Counter() {
  const [state, setState] = createState({
    counter: 0
  });
  setInterval(() => {
    setState({
      counter: state.counter + 1
    });
  });
  return function () {
    const _el$ = _tmpl$.cloneNode(true),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling;

    createEffect(() => {
      _el$3.innerText = state.counter;
    });

    return _el$;
  }();
}
```

Note that the static part string: `Counter:` is left inside the template string passed to `_$template`
We refer to the nested elements by using combination of `firstChild`, `nextSibling` etc.

And this is in short how Solid works. Effectively these two parts: `dependency tracking` and `JSX` provide the best of both worlds. We get the best performance by executing only the minimal code which is needed and with `JSX` we get to keep the mental model introduced by React which keeps us more productive.
