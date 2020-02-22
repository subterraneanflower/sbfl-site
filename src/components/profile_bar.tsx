import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

type ProfileBarProps = {
  author: {
    name: string;
    avatarUrl: string;
    biography?: string;
    twitter?: string;
    gitHub?: string;
    email?: string;
  };
};

type ProfileBarComponentProps = {
  className?: string;
} & ProfileBarProps;

const ProfileBarComponent = ({ className, author }: ProfileBarComponentProps) => (
  <div className={className}>
    <div className="author-title">
      <div className="author-title-name">Author</div>
      <div className="underline"></div>
    </div>
    <div className="author-container">
      <img className="avatar" src={author.avatarUrl} />
      <div>
        <div className="author-name">{author.name}</div>
        <div className="author-bio">{author.biography}</div>
      </div>
    </div>
    <div className="author-account">
      {author.twitter ? (
        <div className="twitter">
          <a className="account-label twitter-label" href={`https://twitter.com/${author.twitter}`} target="_blank">
            Twitter
          </a>
        </div>
      ) : null}
      {author.gitHub ? (
        <div className="github">
          <a className="account-label github-label" href={`https://github.com/${author.gitHub}`} target="_blank">
            GitHub
          </a>
        </div>
      ) : null}
      {author.email ? (
        <div className="email">
          <a className="account-label email-label" href={`mailto:${author.email}`} target="_blank">
            Email
          </a>
        </div>
      ) : null}
    </div>
  </div>
);

const StyledProfileBarComponent = styled(ProfileBarComponent)`
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 7px;
  padding: 1em;

  & .author-title {
    margin-bottom: 1em;
  }

  & .underline {
    background-color: var(--brand-color);
    width: 8em;
    height: 2px;
  }

  & .author-title-name {
    color: var(--brand-color);
    font-size: 1.2em;
  }

  & .author-container {
    display: flex;
    align-items: center;
    margin-bottom: 1em;
  }

  & .author-name {
    color: var(--brand-color);
  }

  & .author-bio {
    color: gray;
  }

  & .avatar {
    display: block;
    border-radius: 100%;
    border: solid 2px gray;
    width: 3em;
    height: 3em;
    margin-right: 1em;
  }

  & .author-account {
    display: flex;
    justify-content: flex-end;
  }

  & .account-label {
    border-radius: 4px;
    color: white;
    font-size: 0.8em;
    padding: 0.3em 1em;
    margin-right: 0.5em;
    cursor: pointer;
    text-decoration: none;
  }

  & .twitter-label {
    background-color: rgb(29, 161, 242);
  }

  & .github-label {
    background-color: rgb(36, 41, 46);
  }

  & .email-label {
    background-color: rgb(110, 116, 120);
  }
`;

export const ProfileBar = (props: ProfileBarProps) => {
  return <StyledProfileBarComponent {...props} />;
};
