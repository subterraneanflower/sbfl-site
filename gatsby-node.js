const path = require('path');
const { JSDOM } = require('jsdom');
const { buildPath } = require('./lib/path_builder');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    query {
      recentPosts: allContentfulBlogPost(sort: { fields: publishedAt, order: DESC }, limit: 5) {
        edges {
          node {
            title
            slug
            publishedAt
          }
        }
      }
      allContentfulBlogPost {
        allCategories: distinct(field: category)
        allTags: distinct(field: tags)
        edges {
          node {
            title
            category
            tags
            slug
            author {
              name
              avatar {
                file {
                  url
                }
              }
              biography
              twitter
              gitHub
              email
            }
            content {
              content
              childMarkdownRemark {
                html
              }
            }
            publishedAt
            compat
          }
        }
      }
    }
  `);

  const allPosts = result.data.allContentfulBlogPost.edges.map((edge) => edge.node);
  const allTags = result.data.allContentfulBlogPost.allTags;
  const allCategories = result.data.allContentfulBlogPost.allCategories;

  const recentPosts = result.data.recentPosts.edges
    .map((edge) => edge.node)
    .map((p) => ({ ...p, pagePath: buildPath(new Date(p.publishedAt), p.slug) }));

  // それぞれのページ
  for (const post of allPosts) {
    const pagePath = buildPath(new Date(post.publishedAt), post.slug);
    const content = post.compat === 'sbfl_wp_2013' ? post.content.content : post.content.childMarkdownRemark.html;
    const author = {
      name: post.author.name,
      avatarUrl: post.author.avatar.file.url,
      biography: post.author.biography,
      twitter: post.author.twitter,
      gitHub: post.author.gitHub,
      email: post.author.email
    };

    createPage({
      path: pagePath,
      component: path.resolve('./src/templates/single_article.tsx'),
      context: {
        articleData: {
          title: post.title,
          slug: post.slug,
          pagePath,
          category: post.category,
          tags: post.tags || [],
          author,
          content,
          publishedAt: post.publishedAt
        },
        blogData: {
          recentPosts,
          allCategories,
          allTags
        }
      }
    });
  }

  // ページネーション作成
  const postPerPage = 5;

  const createPaginated = async (basePath, postPerPage, filter) => {
    const countResult = await graphql(`
      query {
        allContentfulBlogPost${filter ? '(filter: ' + filter + ')' : ''} {
          totalCount
        }
      }
    `);

    const numPages = Math.ceil(countResult.data.allContentfulBlogPost.totalCount / postPerPage);

    for (let i = 0; i < numPages; i++) {
      const pagedResult = await graphql(`
        query {
          allContentfulBlogPost(
            sort: { fields: publishedAt, order: DESC },
            limit: ${postPerPage},
            skip: ${postPerPage * i}${filter ? ',\n' : ''}${filter ? 'filter: ' + filter : ''}
          ) {
            edges {
              node {
                title
                category
                tags
                slug
                author {
                  name
                  avatar {
                    file {
                      url
                    }
                  }
                  biography
                  twitter
                  gitHub
                  email
                }
                content {
                  content
                  childMarkdownRemark {
                    html
                  }
                }
                publishedAt
              }
            }
          }
        }`);

      const pagedArticles = pagedResult.data.allContentfulBlogPost.edges.map((edge) => edge.node);
      const articleSummaries = pagedArticles.map(({ tags, author: authorRef, content, ...post }) => {
        const pagePath = buildPath(new Date(post.publishedAt), post.slug);
        const author = {
          name: authorRef.name,
          avatarUrl: authorRef.avatar.file.url,
          biography: authorRef.biography,
          twitter: authorRef.twitter,
          gitHub: authorRef.gitHub,
          email: authorRef.email
        };

        const html = post.compat === 'sbfl_wp_2013' ? content.content : content.childMarkdownRemark.html;
        const dom = JSDOM.fragment(html);
        const excerpt = dom.textContent.slice(0, 100) + '…';

        return {
          ...post,
          tags: tags || [],
          pagePath,
          author,
          excerpt
        };
      });

      createPage({
        path: i === 0 ? `${basePath}` : `${basePath}/page/${i + 1}`,
        component: path.resolve('./src/templates/blog_page.tsx'),
        context: {
          articleSummaries,
          blogData: {
            recentPosts,
            allCategories,
            allTags
          },
          basePath,
          numPages,
          currentPage: i + 1
        }
      });
    }
  };

  // 一覧ページ
  await createPaginated('/blog', postPerPage);

  // タグページ
  for (const tag of allTags) {
    await createPaginated(`/blog/tag/${tag}`, postPerPage, `{tags: {in: "${tag}"}}`);
  }

  // カテゴリページ
  for (const category of allCategories) {
    await createPaginated(`/blog/category/${category}`, postPerPage, `{category: {eq: "${category}"}}`);
  }
};
