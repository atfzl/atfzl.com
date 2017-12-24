import React from 'react';
import { getSiteProps, Link } from 'react-static';
//

export default getSiteProps(() => (
  <div style={{ margin: '' }}>
    <h1>Atif Afzal</h1>
    <div>
      <Link to="/blog">Blog</Link>
    </div>
  </div>
));
