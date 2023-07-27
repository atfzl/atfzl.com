+++
title = "Making Cypress Integration Tests Less Flaky"
date = "2022-02-01"
+++

# Making Cypress Integration Tests Less Flaky

---

## TL;DR
1. Interleave [Cypress](https://www.cypress.io) commands like `.find`, `.get`, `.first`, `.eq`, `.type` with Cypress assertions like `.should`, `.contains`.
    > Cypress runs only the last command when retrying. Interleaving act as guards to ensure we reach to the correct element which also helps avoiding detached parent errors.
2. Don't just wait for network calls, wait for the UI to be updated with the network data.
    > If a network call has finished, it doesn't mean the UI would be updated immediately.

---

## Example 1
**BAD**:
```js
cy.get('.parent').find('.child');

// If `.parent` got detached and rerendered,
// then the `.find` command would fail, as it
// would try to run `.find` on the now detached parent.
// This could happen in case of a loading `shimmer` component.
```
**GOOD**:
```js
cy.get('.parent .child');

// While `.child` has not rendered, Cypress will
// keep retrying the last command, i.e. the complete
// cy.get command.
// Even if `.parent` got detached, Cypress would
// run the complete command when it is trying to
// find `.child`.
```
or
```js
cy.get('.parent')
  .should('have.length', 3) // we made sure that the child has rendered
  .find('.child');
```
or
```js
cy.get('.parent')
  .contains('some text after which i am sure a child has rendered')
  .find('.child')
```

---

## Example 2
**BAD**:
```js
cy.get('.new-todo').type('todo A{enter}');
cy.get('.todo-list')
  .first()
  .should('contain', 'todo A');

cy.get('.new-todo').type('todo B{enter}');
cy.get('.todo-list') // talking about this below
  .first()
  .should('contain', 'todo B');

// It might take some time for `todo B` to be visible on UI after
// `.type('todo B{enter}') because of async rendering/server calls etc.
// `cy.get('.todo-list')` in this case returns the list with only
// `todo A` because `todo B` is still not in UI. And then calling
// `.first()` returns `todo A`.
//
// Cypress retries only the last command which in this case would be
// `.first()` which would still return `todo A`, because
// `cy.get('.todo-list')` still returns old list.

```
or
```js
cy.get('.new-todo').type('todo A{enter}');
cy.get('.todo-list:first')
  .should('contain', 'todo A');

cy.get('.new-todo').type('todo B{enter}');
cy.get('.todo-list:first')
  .should('contain', 'todo B');

// This would retry `cy.get('.todo-list:first')` which gets the
// correct UI element after retrying.
// This test is not flaky, but it uses `:first` which is deprecated in
// jquery and will be removed in jquery 4
```
**GOOD**:
```js
cy.get('.new-todo').type('todo A{enter}');
cy.get('.todo-list')                        // command
  .should('have.length', 1)                 // assertion
  .first()                                  // command
  .should('contain', 'todo A');             // assertion

cy.get('.new-todo').type('todo B{enter}');
cy.get('.todo-list')                        // command
  .should('have.length', 2)                 // assertion
  .first()                                  // command
  .should('contain', 'todo B');             // assertion

// We have interspersed commands with assertions.
```

---

## Example 3
**BAD**:
```js
cy.wait('@myNetworkCall');

cy.get('.ag-center-cols-viewport').
  .find('.ag-row')
  .first()
  .click();

// The parent `.ag-center-cols-viewport` might get detached before
// finding the child
```
or
```js
cy.wait('@myNetworkCall');

cy.get('.ag-center-cols-viewport .ag-row:first')
  .click();

// we might click on the first loading row of the table
```

**GOOD**:
```js
cy.wait('@myNetworkCall');

cy.get('.ag-center-cols-viewpost')
  .contains('My data from network call now in UI')
  .get('.ag-row') // now sure we'll get the correct element because
  .first()        // of the assertion made above
  .click();

// check if UI state is updated in the parent container before querying
// for child element
```

---

## Example 4
**BAD**:
```js
cy.get('.ag-center-cols-viewport')
  .find('.ag-row')
  .first();
// element from `cy.get` or element from `.find` might get detached
```
or
```js
cy.get('.ag-center-cols-viewport .ag-row')
  .first();
// element from `cy.get` might get detached
```
or
```js
cy.get('.ag-center-cols-viewport .ag-row:first');

// :first is not a valid css selector. It is only supported by jquery, 
// but it is deprecated and will be removed in future.
```
**GOOD**:
```js
cy.get('.ag-center-cols-viewport')
  .should('have.length', 10) // verify that we indeed have multiple rows
  .first();
```
or
```js
cy.get('.ag-center-cols-viewport')
  .contains('data from network call') // verify data populated
  .first();
```


## References
- [Reduce Inconsistent Interactions in the dom | spin.atomicobject.com](https://spin.atomicobject.com/2021/07/20/reduce-flakiness-cypress-tests/#:~:text=reduce%20inconsistent%20interactions%20in%20the%20dom)
- [Do not get too detached | Cypress Blog](https://www.cypress.io/blog/2020/07/22/do-not-get-too-detached/)
- [Retry Ability | Cypress Blog](https://docs.cypress.io/guides/core-concepts/retry-ability)
