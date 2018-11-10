/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import MarkdownPage from 'components/MarkdownPage';
import { createLinkBlog } from 'utils/createLink';

const Blog = ({ data, location }) => (
  <MarkdownPage
    authors={data.markdownRemark.frontmatter.author}
    createLink={createLinkBlog}
    date={data.markdownRemark.fields.date}
    location={location}
    ogDescription={data.markdownRemark.frontmatter.excerpt}
    markdownRemark={data.markdownRemark}
    sectionList={data.markdownRemark.frontmatter.catalogue || []}
    titlePostfix=" - little forest"
  />
);

Blog.propTypes = {
  data: PropTypes.object.isRequired,
};

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query TemplateBlogMarkdown($slug: String!) {
    markdownRemark(fields: {slug: {eq: $slug}}) {
      html
      frontmatter {
        title
        img
        author
        excerpt
        catalogue
      }
      fields {
        date(formatString: "MMMM DD, YYYY")
        path
        slug
      }
    }
    allMarkdownRemark(
      limit: 10
      filter: {id: {regex: "/blog/"}}
      sort: {fields: [fields___date], order: DESC}
    ) {
      edges {
        node {
          frontmatter {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`;

export default Blog;
