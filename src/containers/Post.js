/* eslint-disable react/no-danger */

import React from 'react';
import { getRouteProps } from 'react-static';
import marked from 'marked';

import * as highlight from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

class Post extends React.Component {
  componentDidMount() {
    highlight.initHighlighting();
  }

  render() {
    const { post } = this.props;
    const body = marked(post.body);

    return (
      <div>
        <article dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    );
  }
}

export default getRouteProps(Post);
