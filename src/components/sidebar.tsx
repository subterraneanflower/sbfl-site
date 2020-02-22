import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';
import { Card } from './card';
import { BlogData } from '../types/blog';

type SidebarProps = {
  blogData: BlogData;
};

type SidebarComponentProps = {
  className?: string;
} & SidebarProps;

const SidebarComponent = ({ className, blogData: articleData }: SidebarComponentProps) => (
  <aside className={className}>
    <Card className="sidebar-card">
      <h2>RSS</h2>
      <ul className="recent-posts">
        <li>
          <Link to="/blog/feed/index.xml">RSS Feed</Link>
        </li>
      </ul>
    </Card>

    <Card className="sidebar-card">
      <h2>最近の投稿</h2>
      <ul className="recent-posts">
        {articleData.recentPosts.map((p) => (
          <li key={p.slug}>
            <Link to={p.pagePath}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </Card>

    <Card className="sidebar-card">
      <h2>カテゴリ</h2>
      <ul className="categories">
        {articleData.allCategories.map((c) => (
          <li key={c}>
            <Link to={`/blog/category/${encodeURIComponent(c)}`}>{c}</Link>
          </li>
        ))}
      </ul>
    </Card>

    <Card className="sidebar-card">
      <h2>タグ</h2>
      <div className="tags">
        {articleData.allTags.map((t) => (
          <div className="tag" key={t}>
            <Link to={`/blog/tag/${encodeURIComponent(t)}`}>{t}</Link>
          </div>
        ))}
      </div>
    </Card>
  </aside>
);

const StyledSidebarComponent = styled(SidebarComponent)`
  & a {
    color: inherit;
    text-decoration: none;
  }

  & .sidebar-card {
    padding: 2em;
    margin-bottom: 1em;
  }

  & h2 {
    font-weight: normal;
    text-align: center;
    margin-bottom: 1em;
  }

  & .recent-posts,
  & .categories {
    color: var(--brand-color);
    margin-left: 2em;
    & li {
      padding: 0.3em 0;
    }
  }

  & .tags {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  & .tag {
    background-color: var(--brand-color);
    border-radius: 3px;
    color: white;
    font-size: 0.8em;
    padding: 0.3em 1em;
    margin-right: 0.5em;
    margin-bottom: 0.5em;
    cursor: pointer;
    user-select: none;
  }
`;

export const Sidebar = (props: SidebarProps) => {
  return <StyledSidebarComponent {...props} />;
};
