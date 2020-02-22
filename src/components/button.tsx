import React from 'react';
import styled from 'styled-components';

type ButtonProps = {} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonComponentProps = {
  className?: string;
} & ButtonProps;

const ButtonComponent = ({ className, ...props }: ButtonComponentProps) => (
  <button className={className} {...props}></button>
);

const StyledButtonComponent = styled(ButtonComponent)`
  background-color: var(--brand-color);
  border: none;
  border-radius: 3px;
  color: white;
  font-size: 1em;
  padding: 0.3em 2em;
  cursor: pointer;
`;

export const Button = (props: ButtonProps) => {
  return <StyledButtonComponent {...props} />;
};
