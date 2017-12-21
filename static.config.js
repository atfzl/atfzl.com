import fp from 'lodash/fp';

import contentClient from './services/contentful';

export default {
  siteRoot: 'https://atfzl.com',
  getSiteProps: () => ({
    title: 'React Static',
  }),
  getRoutes: async () => {
    const resp = await contentClient.getEntries();

    const posts = fp.compose(fp.flatMap(fp.get('fields')), fp.get('items'))(
      resp,
    );

    return [
      {
        path: '/',
        component: 'src/containers/Home',
      },
      {
        path: '/about',
        component: 'src/containers/About',
      },
      {
        path: '/blog',
        component: 'src/containers/Blog',
        getProps: () => ({
          posts,
        }),
        children: posts.map(post => ({
          path: `/post/${post.id}`,
          component: 'src/containers/Post',
          getProps: () => ({
            post,
          }),
        })),
      },
      {
        is404: true,
        component: 'src/containers/404',
      },
    ];
  },
};
