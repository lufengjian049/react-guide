import React from 'react'

export default function ContextComposer({contexts, children}) {
  if (typeof children === 'function') {
    //compose Consumer
    const curriedContexts = [];
    const curry = (currentContexts) => {
      const Context = currentContexts.shift();
      return (
        <Context.Consumer>
          {
            (providedContext) => {
              curriedContexts.push(providedContext);
              return currentContexts.length
                ? curry(currentContexts)
                : children(...curriedContexts);
            }
          }
        </Context.Consumer>
      );
    }
    return curry(contexts);
  } else {
    // Compose Providers
    return contexts.reduceRight((child, context) => {
      return React.cloneElement(context, {
          children: child
      })
    },children);
  }
}
