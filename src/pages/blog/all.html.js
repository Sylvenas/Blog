/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 * @flow
 */

'use strict';

import Link from 'gatsby-link';
import Container from 'components/Container';
import Header from 'components/Header';
import TitleAndMetaTags from 'components/TitleAndMetaTags';
import React from 'react';
import { urlRoot } from 'site-constants';
import { colors, media, sharedStyles } from 'theme';
import toCommaSeparatedList from 'utils/toCommaSeparatedList';
import MetaTitle from 'templates/components/MetaTitle';

import type {allMarkdownRemarkData } from 'types';

type Props = {
  data: allMarkdownRemarkData,
};

const AllBlogPosts = ({ data }: Props) => {
  console.log(data.allMarkdownRemark.edges[0].node)
  return (<Container>
    <div css={sharedStyles.articleLayout.container}>
      <div css={sharedStyles.articleLayout.content}>
        <div css={{
          fontSize: 14,
          fontFamily: '"brandon-grotesque", sans-serif',
          fontWeight: "bold",
          color: '#7e8890',
          textTransform: 'uppercase',
          letterSpacing: '.075em',
          textAlign: 'center',
          marginBottom: '25px'
        }}>Less is More</div>
        <TitleAndMetaTags
          ogUrl={`${urlRoot}/blog/all.html`}
          title="React - All Posts"
        />
        <ul
          css={{
            display: 'flex',
            flexWrap: 'wrap',
          }}>
          {data.allMarkdownRemark.edges.map(({ node }) => (
            <li
              css={{
                width: '100%',
                minHeight: 500,
                [media.size('medium')]: {
                  width: '50%',
                },

                [media.greaterThan('large')]: {
                  width: '30.303%',
                  float: 'left',
                  margin: '0 1.515% 1.875em'
                },
              }}
              key={node.fields.slug}>
              <Link
                key={node.fields.slug}
                to={node.fields.slug}>
                <img src={node.frontmatter.img} css={{ width: '100%', height: '44%' }} />
                {/* {node.frontmatter.title} */}
              </Link>
              <h2 css={{
                fontFamily: '"brandon-grotesque", sans-serif',
                fontSize: 10,
                letterSpacing: '.1em',
                color: '#7e8890',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: 15,
                marginTop: 44,
                textAlign: 'center',
                cursor: 'pointer',
                ':hover': {
                  color: '#323a45'
                }
              }}>{node.frontmatter.categories ? node.frontmatter.categories[0] : ''}</h2>
              <h1 css={{
                fontFamily: '"brandon-grotesque", sans-serif',
                fontSize: 18,
                lineHeight: '27px',
                letterSpacing: '.065em',
                color: '#fc3768',
                textTransform: 'uppercase',
                fontWeight: 700,
                maxWidth: 270,
                margin: '0 auto',
                textAlign: 'center',
                cursor: 'pointer',
                ':hover': {
                  color: '#b1032e',
                },
              }}>{node.frontmatter.title}</h1>
              <p css={{
                fontSize: 14,
                lineHeight: '27px',
                color: '#333c4e',
                padding: '0 25px',
                textAlign: 'center',
                marginTop: '30px'
              }}>{node.excerpt}</p>
              {/* <MetaTitle>{node.fields.date}</MetaTitle>
              <div
                css={{
                  color: colors.subtle,
                  marginTop: -5,
                }}>
                by{' '}
                {toCommaSeparatedList(node.frontmatter.author, author => (
                  <span key={author.frontmatter.name}>
                    {author.frontmatter.name}
                  </span>
                ))}
              </div> */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Container>
  )
};

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query AllBlogPostsPageQuery {
    allMarkdownRemark(
      filter: {id: {regex: "/blog/"}}
      sort: {fields: [fields___date], order: DESC}
    ) {
      edges {
        node {
          excerpt
          frontmatter {
            title
            author {
              frontmatter {
                name
                url
              }
            }
            id
            categories
            img
            excerpt
          }
          fields {
            date(formatString: "MMMM DD, YYYY")
            slug
          }
        }
      }
    }
  }
`;

export default AllBlogPosts;
