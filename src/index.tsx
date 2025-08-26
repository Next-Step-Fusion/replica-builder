//
// This is the entry point to the app.
//

import './before-index.ts';
// keep the empty line below this comment to preserve sorting order

// important to load our styles first
import './theme.ts';
// keep the empty line below this comment to preserve sorting order

import ReactDOM from 'react-dom/client';
import { Root } from './Root.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
