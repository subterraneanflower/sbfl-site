import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Card } from './card';
import { Button } from './button';
import { ArticleSummaryData } from '../types/blog';
import { Link, navigate } from 'gatsby';

type ArticleSummaryProps = {
  articleSummary: ArticleSummaryData;
} & React.HTMLAttributes<HTMLElement>;

type ArticleSummaryComponentProps = {
  className?: string;
  publishedDateString: string;
  onContinueReading: () => any;
} & ArticleSummaryProps;

const ArticleSummaryComponent = ({
  className,
  articleSummary,
  publishedDateString,
  onContinueReading,
  ...props
}: ArticleSummaryComponentProps) => (
  <Card className={className}>
    <article>
      <header className="article-header">
        <h1 className="article-title">
          <Link className="article-title-link" to={articleSummary.pagePath}>
            {articleSummary.title}
          </Link>
        </h1>
        <div className="article-tag-list">
          <div className="category tag">
            <Link to={`/blog/category/${encodeURIComponent(articleSummary.category)}`}>{articleSummary.category}</Link>
          </div>
          {articleSummary.tags.map((t) => (
            <div key={t} className="tag">
              <Link to={`/blog/tag/${encodeURIComponent(t)}`}>{t}</Link>
            </div>
          ))}
        </div>
        <div className="article-date">{publishedDateString}</div>
      </header>
      <section className="article-content">
        <p>{articleSummary.excerpt}</p>
      </section>
      <div className="button-container">
        <Button onClick={onContinueReading}>続きを読む</Button>
      </div>
    </article>
  </Card>
);

const StyledArticleSummaryComponent = styled(ArticleSummaryComponent)`
  max-width: 60em;
  min-width: 25em;

  & .article-header {
    margin-bottom: 2em;
  }

  & .article-title {
    font-size: 1.5em;
    margin-bottom: 0.5em;
  }

  & .article-title-link {
    color: var(--brand-color);
    text-decoration: none;
  }

  & .article-tag-list {
    display: flex;

    & a {
      color: inherit;
      text-decoration: none;
    }
  }

  & .article-tag-list .tag {
    background-color: var(--brand-color);
    border-radius: 3px;
    color: white;
    font-size: 0.8em;
    padding: 0.3em 1em;
    margin-right: 0.5em;
    cursor: pointer;
    user-select: none;
  }

  & .article-tag-list .tag.category {
    background-color: var(--accent-color);
  }

  & .article-date {
    text-align: right;
    margin-bottom: 1em;
  }

  & .article-content p {
    line-height: 2;
    margin: 1em 0 2em 0;
  }

  & .button-container {
    text-align: right;
  }
`;

export const ArticleSummary = (props: ArticleSummaryProps) => {
  const publishedDate = new Date(props.articleSummary.publishedAt);
  const year = publishedDate.getFullYear().toString();
  const month = (publishedDate.getMonth() + 1).toString().padStart(2, '0');
  const date = publishedDate
    .getDate()
    .toString()
    .padStart(2, '0');
  const publishedDateStr = `${year}/${month}/${date}`;

  const onContinueReading = useCallback(() => {
    navigate(props.articleSummary.pagePath);
  }, [props.articleSummary.pagePath]);

  return (
    <StyledArticleSummaryComponent
      publishedDateString={publishedDateStr}
      onContinueReading={onContinueReading}
      {...props}
    />
  );
};
