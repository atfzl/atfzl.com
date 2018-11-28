import React from 'react';
import { Router, Link } from 'react-static';
//
import Routes from 'react-static-routes';

import 'normalize.css';
import './app.css';

export default () => (
  <Router>
    <div>
      <div className="header">
        <Link className="header-link" to="/">
          <img className="home-icon" src="/images/home-icon.png" alt="home" />
        </Link>
      </div>
      <div className="content">
        <Routes />
      </div>
    </div>
  </Router>
);
