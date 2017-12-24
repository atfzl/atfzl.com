import React from 'react';
import { getRouteProps, Link, Head } from 'react-static';
//
import Heading from '../components/Heading';
import * as utils from '../utils';

export default getRouteProps(({ posts }) => (
  <div
    style={{
      marginTop: '10vh',
    }}
  >
    <Head>
      <title>Atif Afzal Blog</title>
    </Head>
    <Heading>Blog Posts</Heading>
    <div>
      {posts.map(post => (
        <div
          style={{ display: 'flex', justifyContent: 'space-between' }}
          key={post.fields.id}
        >
          <Link to={`/blog/post/${post.fields.id}/`}>{post.fields.title}</Link>
          <div style={{ color: 'grey' }}>
            {utils.formatDate(post.sys.createdAt, { weekday: undefined })}
          </div>
        </div>
      ))}
    </div>
  </div>
));
