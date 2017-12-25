/* eslint-disable react/no-danger */

import React from 'react';
import { getRouteProps, Head } from 'react-static';
import marked from 'marked';

import hljs from '../highlight';
import * as utils from '../utils';

const Post = ({ post }) => {
  const body = marked(post.fields.body, {
    highlight: code => hljs.highlightAuto(code).value,
  });
  const date = utils.formatDate(post.sys.createdAt);

  return (
    <div>
      <Head>
        <title>{post.fields.title}</title>
      </Head>
      <div>{date}</div>
      <h1>{post.fields.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
};

export default getRouteProps(Post);
