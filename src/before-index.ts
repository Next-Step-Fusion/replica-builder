//
// This file can be used to run some logic before any app code is run
//

import { configure } from 'mobx';

// This verifies that uninitialized class properties
// are defined (useDefineForClassFields) which is crucial for mobx to work
if (
  !new (class {
    //@ts-expect-error
    x;
  })().hasOwnProperty('x')
)
  throw new Error('Transpiler is not configured correctly');

// in case of dynamic module import errors, which can happen when CDN is is process of updating files
window.addEventListener('vite:preloadError', (_event) => {
  window.location.reload();
  //event.preventDefault(); // if sentry gets too many errors, uncomment this
});

// Some mobx defaults
configure({ enforceActions: 'never' });
