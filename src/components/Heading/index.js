import React from 'react';

const Heading = props => (
  <h1
    style={{
      fontSize: '4.4rem',
      marginBottom: '2rem',
    }}
  >
    {props.children}
  </h1>
);

export default Heading;
