import React from 'react';
import { getRouteProps, Link } from 'react-static';
//
import Heading from '../components/Heading';

export default getRouteProps(({ posts }) => (
  <div
    style={{
      marginTop: '10vh',
    }}
  >
    <Heading>Blog Posts</Heading>
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <Link to={`/blog/post/${post.id}/`}>{post.title}</Link>
        </div>
      ))}
    </div>
  </div>
));
