/* eslint-disable react/no-danger */

import React from 'react';
import { getRouteProps, Link } from 'react-static';
import marked from 'marked';

export default getRouteProps(({ post }) => {
  const body = marked(post.body);

  return (
    <div>
      <Link to="/blog/">{'<'} Back</Link>
      <br />
      <h3>{post.title}</h3>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
});
