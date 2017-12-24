import React from 'react';
import { Router, Link } from 'react-static';
//
import Routes from 'react-static-routes';

import 'normalize.css';
import '@ibm/type/css/ibm-type.min.css';
import './app.css';

export default () => (
  <Router>
    <div className="ibm">
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <div className="content">
        <Routes />
      </div>
    </div>
  </Router>
);
