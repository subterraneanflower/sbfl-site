import React, { useCallback } from 'react';

import { Layout } from '../components/layout';
import SEO from '../components/seo';
import styled from 'styled-components';
import { Sidebar } from '../components/sidebar';
import { BlogData, ArticleSummaryData } from '../types/blog';
import { ArticleSummary } from '../components/article_summary';
import { Button } from '../components/button';
import { navigate } from 'gatsby';

type BlogPageProp = {
  pageContext: {
    blogData: BlogData;
    articleSummaries: ArticleSummaryData[];
    basePath: string;
    currentPage: number;
    numPages: number;
  };
};

type BlogPageComponentProp = {
  className?: string;
  gotoNewer: () => any;
  gotoOlder: () => any;
} & BlogPageProp;

const StyledSidebar = styled(Sidebar)`
  margin-left: 1em;
  width: 350px;

  @media screen and (max-width: 1100px) {
    display: none;
  }
`;

const BlogPageComponent = (props: BlogPageComponentProp) => (
  <Layout siteMetadata={{ title: 'Subterranean Flower Blog' }} headerLinkTo="/blog/">
    <SEO title={'Subterranean Flower Blog'} />
    <div className={props.className}>
      <div>
        {props.pageContext.articleSummaries.map((a) => {
          return <ArticleSummary className="article-summary" key={a.pagePath} articleSummary={a} />;
        })}
        <div className="nav-buttons">
          {props.pageContext.currentPage > 1 ? (
            <Button className="newer-posts" onClick={props.gotoNewer}>
              Newer Posts
            </Button>
          ) : (
            <div />
          )}
          {props.pageContext.currentPage < props.pageContext.numPages ? (
            <Button className="older-posts" onClick={props.gotoOlder}>
              Older Posts
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
      <StyledSidebar blogData={props.pageContext.blogData} />
    </div>
  </Layout>
);

const StyledBlogPageComponent = styled(BlogPageComponent)`
  display: flex;
  justify-content: center;
  padding-bottom: 3em;

  & .article-summary {
    margin-bottom: 1em;
  }

  & .nav-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2em;

    & button {
      padding: 0.8em 2em;
    }
  }
`;

export const BlogPage = (props: BlogPageProp) => {
  const gotoNewer = useCallback(() => {
    const newerPage = props.pageContext.currentPage - 1;
    const path =
      newerPage === 1 ? `${props.pageContext.basePath}/` : `${props.pageContext.basePath}/page/${newerPage}/`;
    navigate(path);
  }, [props.pageContext.basePath, props.pageContext.currentPage]);

  const gotoOlder = useCallback(() => {
    const olderPage = props.pageContext.currentPage + 1;
    const path = `${props.pageContext.basePath}/page/${olderPage}/`;
    navigate(path);
  }, [props.pageContext.basePath, props.pageContext.currentPage]);

  return <StyledBlogPageComponent gotoNewer={gotoNewer} gotoOlder={gotoOlder} {...props} />;
};

export default BlogPage;
