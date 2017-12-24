import contentClient from './services/contentful';

export default {
  siteRoot: 'https://atfzl.com',
  getSiteProps: () => ({
    title: 'Atif Afzal',
  }),
  getRoutes: async () => {
    const resp = await contentClient.getEntries();

    const posts = resp.items;

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
          path: `/post/${post.fields.id}`,
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
