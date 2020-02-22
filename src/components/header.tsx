import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

type HeaderProps = {
  siteTitle: string;
  linkTo?: string;
};

type HeaderComponentProps = {
  className?: string;
} & HeaderProps;

const HeaderComponent = ({ className, siteTitle, linkTo }: HeaderComponentProps) => (
  <header className={className}>
    <h1>
      <Link className="header-link" to={linkTo || '/'}>
        {siteTitle}
      </Link>
    </h1>
  </header>
);

const StyledHeaderComponent = styled(HeaderComponent)`
  position: sticky;
  top: 0;
  background-color: var(--brand-color);
  padding: 0.8em var(--page-padding-horizontal);
  z-index: 1;

  & .header-link {
    color: white;
    text-decoration: none;
  }

  & h1 {
    font-size: 1.2em;
  }
`;

export const Header = (props: HeaderProps) => {
  return <StyledHeaderComponent {...props} />;
};
