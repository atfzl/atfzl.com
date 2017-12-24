import React from 'react';
import { getSiteProps, Link } from 'react-static';
//
import Heading from '../components/Heading';

export default getSiteProps(() => (
  <div style={{ marginTop: '10vh' }}>
    <Heading>Atif Afzal</Heading>
    <div>
      <Link to={'/blog'}>Blog</Link>
    </div>
  </div>
));
