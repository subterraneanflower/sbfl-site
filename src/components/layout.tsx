import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import styled from 'styled-components';

import { Header } from './header';

import './layout.css';

type LayoutProps = {
  children: React.ReactNode;
  siteMetadata: {
    title: string;
  };
  headerLinkTo?: string;
};

type LayoutComponentProps = {
  className?: string;
} & LayoutProps;

const LayoutComponent = ({ className, siteMetadata, children, headerLinkTo }: LayoutComponentProps) => (
  <>
    <Header siteTitle={siteMetadata.title} linkTo={headerLinkTo} />
    <div className={className}>
      <main>{children}</main>
    </div>
  </>
);

const StyledLayoutComponent = styled(LayoutComponent)`
  padding: 2em var(--page-padding-horizontal);
`;

export const Layout = (props: LayoutProps) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return <StyledLayoutComponent siteMetadata={data.site.siteMetadata} {...props} />;
};
