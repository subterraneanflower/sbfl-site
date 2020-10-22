const { JSDOM } = require('jsdom');
const { buildPath } = require('./lib/path_builder');

module.exports = {
  siteMetadata: {
    title: `Subterranean Flower`,
    description: `フロントエンドとかいろいろ`,
    author: `@kfurumiya`,
    siteUrl: 'https://sbfl.net'
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'noopener'
            }
          }
        ]
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || process.env.CONTENTFUL_PREVIEW_TOKEN,
        host: process.env.CONTENTFUL_PREVIEW_TOKEN ? `preview.contentful.com` : undefined,
        downloadLocal: true
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-typescript`,
    {
      resolve: 'gatsby-plugin-graphql-codegen',
      options: {
        fileName: `types/graphql-types.d.ts`
      }
    },
    `gatsby-plugin-styled-components`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            serialize: ({ query: { site, allContentfulBlogPost } }) => {
              return allContentfulBlogPost.edges.map(({ node: post }) => {
                const content =
                  post.compat === 'sbfl_wp_2013' ? post.content.content : post.content.childMarkdownRemark.html;
                const dom = JSDOM.fragment(content);
                const excerpt = dom.textContent.slice(0, 100) + '…';

                return {
                  title: post.title,
                  description: excerpt,
                  date: post.publishedAt,
                  url: site.siteMetadata.siteUrl + buildPath(new Date(post.publishedAt), post.slug),
                  guid: site.siteMetadata.siteUrl + buildPath(new Date(post.publishedAt), post.slug),
                  custom_elements: [{ 'content:encoded': content }]
                };
              });
            },
            query: `
              {
                allContentfulBlogPost(sort: { fields: publishedAt, order: DESC }, limit: 10) {
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
            `,
            output: 'blog/feed/index.xml',
            title: 'Subterranean Flower Blog',
            match: '^/blog/[0-9]+/[0-9]+/*'
          }
        ]
      }
    }
  ]
};
