import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

type CardProps = {} & React.HTMLAttributes<HTMLElement>;

type CardComponentProps = {
  className?: string;
} & CardProps;

const CardComponent = ({ className, children, ...props }: CardComponentProps) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const StyledCardComponent = styled(CardComponent)`
  background-color: var(--card-bg-color);
  border-radius: 3px;
  box-shadow: 0 0 12px var(--shadow-color);
  color: var(--text-color);
  padding: 2em 3em;
`;

export const Card = (props: CardProps) => {
  return <StyledCardComponent {...props} />;
};
