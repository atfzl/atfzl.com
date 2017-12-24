/* eslint-disable react/no-danger */

import React from 'react';
import { getRouteProps, Head } from 'react-static';
import marked from 'marked';

import * as highlight from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

import * as utils from '../utils';

const Post = ({ post }) => {
  const body = marked(post.fields.body, {
    highlight: code => highlight.highlightAuto(code).value,
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
