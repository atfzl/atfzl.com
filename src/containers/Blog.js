import React from 'react';
import { getRouteProps, Link } from 'react-static';
//

export default getRouteProps(({ posts }) => (
  <div>
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <Link to={`/blog/post/${post.id}/`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  </div>
));
