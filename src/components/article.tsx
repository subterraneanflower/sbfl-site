import React from 'react';
import styled from 'styled-components';
import { ProfileBar } from './profile_bar';
import { Card } from './card';
import { ArticleData } from '../types/blog';

type ArticleProps = {
  articleData: ArticleData;
} & React.HTMLAttributes<HTMLElement>;

type ArticleComponentProps = {
  className?: string;
  publishedDateString: string;
} & ArticleProps;

const ArticleComponent = ({ className, articleData, publishedDateString, ...props }: ArticleComponentProps) => (
  <Card className={className}>
    <article>
      <header className="article-header">
        <h1 className="article-title">{articleData.title}</h1>
        <div className="article-tag-list">
          <div className="category tag">{articleData.category}</div>
          {articleData.tags.map((t) => (
            <div key={t} className="tag">
              {t}
            </div>
          ))}
        </div>
        <div className="article-date">{publishedDateString}</div>
        <ProfileBar author={articleData.author} />
      </header>
      <section className="article-content" dangerouslySetInnerHTML={{ __html: articleData.content }} />
    </article>
  </Card>
);

const StyledArticleComponent = styled(ArticleComponent)`
  max-width: 60em;
  min-width: 25em;

  & .article-header {
    margin-bottom: 2em;
  }

  & .article-title {
    font-size: 3em;
    margin-bottom: 0.5em;
  }

  & .article-tag-list {
    display: flex;
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
    margin: 1em 0;
    word-break: break-word;

    & > code {
      color: rgb(212, 149, 0);
    }

    & img {
      max-width: 100%;
      height: auto;
    }
  }

  & .article-content figure {
    max-width: 100%;
    text-align: center;
    margin: 3em 0;

    & img,
    & video {
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }
  }

  & .article-content strong {
    color: var(--brand-color);
  }

  & .article-content h2 {
    position: relative;
    border-bottom: 5px solid gray;
    font-size: 2em;
    padding-bottom: 0.3em;
    margin-top: 2em;
    margin-bottom: 1em;

    &::after {
      position: absolute;
      display: block;
      content: ' ';
      border-bottom: solid 5px var(--brand-color);
      bottom: -5px;
      width: 2em;
    }
  }

  & .article-content h3 {
    font-size: 1.5em;
    border-left: 0.3em solid var(--brand-color);
    padding-left: 0.5em;
    margin-top: 2em;
  }
`;

export const Article = (props: ArticleProps) => {
  const publishedDate = new Date(props.articleData.publishedAt);
  const year = publishedDate.getFullYear().toString();
  const month = (publishedDate.getMonth() + 1).toString().padStart(2, '0');
  const date = publishedDate
    .getDate()
    .toString()
    .padStart(2, '0');
  const publishedDateStr = `${year}/${month}/${date}`;

  return <StyledArticleComponent publishedDateString={publishedDateStr} {...props} />;
};
