
'use strict';

import Container from 'components/Container';
import React from 'react';

import type {allMarkdownRemarkData } from 'types';

type Props = {
    data: allMarkdownRemarkData,
};

const AllBlogPosts = ({ data }: Props) => {

  var collections = {},
    categories;
  var edges = data.allMarkdownRemark.edges;
  edges.forEach(edge => {
    var col = {};
    var categorie = edge.node.frontmatter.categories;
    //col.categories = edge.node.frontmatter.categories;
    col.date = edge.node.fields.date;
    col.title = edge.node.frontmatter.title;
    col.slug = edge.node.fields.slug;
    collections[categorie] ? collections[categorie].push(col) : (collections[categorie] = [], collections[categorie].push(col));
  });
  categories = Object.keys(collections);
  return (
    <Container css={{
      position: 'relative',
    }}>
      <div className="timeline">
        {categories.map(categorie => (
          <div key={categorie} className="title">
            <h2 className="year" id={categorie}>
              {categorie}
            </h2>
            <ul className="posts-ul">
              {collections[categorie].map(post => (
                <li key={post.title} className="post-li">
                  <p css={{
                    display: 'none',
                  }} className="post-date-cat">
                    <a
                      href={`/archive.html#${post.date.split(',')[1]}`}>
                      {`${post.date.substr(0, 3)} ${post.date.split(',')[0].split(' ')[1]},${post.date.split(',')[1]}`}
                    </a>
                  </p>
                  <a className="post-title-cat" href={post.slug}>{post.title}</a>
                </li>
              ))}
            </ul>
          </div>)
        )}
      </div>
    </Container>
  );
};

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query AllBlogPostsPageQuery4 {
    allMarkdownRemark(
      filter: {id: {regex: "/blog/"}}
      sort: {fields: [fields___date], order: DESC}
    ) {
      edges {
        node {
          frontmatter {
            title
            author
            categories
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
