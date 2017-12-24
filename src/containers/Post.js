/* eslint-disable react/no-danger */

import React from 'react';
import { getRouteProps } from 'react-static';
import marked from 'marked';

import './index.css';

export default getRouteProps(({ post }) => {
  const body = marked(post.body);

  return (
    <div>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
});
