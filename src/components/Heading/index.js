import React from 'react';

const Heading = props => (
  <h1
    style={{
      fontSize: '4.4rem',
      marginBottom: '2rem',
    }}
    className="ibm-type-semibold"
  >
    {props.children}
  </h1>
);

export default Heading;
