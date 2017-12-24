import React from 'react';
import { getSiteProps, Link, Head } from 'react-static';
//
import Heading from '../components/Heading';

export default getSiteProps(() => (
  <div style={{ marginTop: '10vh' }}>
    <Head>
      <title>Atif Afzal</title>
    </Head>
    <Heading>Atif Afzal</Heading>
    <div>
      <Link to={'/blog'}>Blog</Link>
    </div>
  </div>
));
