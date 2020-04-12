import React, { useCallback } from 'react';
import styled from 'styled-components';

type ShareButtonProps = {} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ShareButtonComponentProps = {
  className?: string;
} & ShareButtonProps;

const ShareButtonComponent = ({ className, ...props }: ShareButtonComponentProps) => (
  <button className={className} {...props}></button>
);

const StyledShareButtonComponent = styled(ShareButtonComponent)`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  position: fixed;
  bottom: 2em;
  right: 2em;
  background: var(--brand-color) url("/blog/static/assets/share.png") no-repeat;
  background-position: center center;
  background-size: contain;
  border: none;
  border-radius: 100%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  width: 3em;
  height: 3em;
  cursor: pointer;
`;

export const ShareButton = (props: ShareButtonProps) => {
  const onClick = useCallback(() => {
    const title = document.title;
    const url = location.href;

    console.log(url, title);

    (navigator as any).share?.({title, url});
  }, []);

  return <StyledShareButtonComponent {...props} onClick={onClick} />;
};
