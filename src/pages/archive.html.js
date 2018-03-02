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

import type { allMarkdownRemarkData } from 'types';

type Props = {
    data: allMarkdownRemarkData,
};

const AllBlogPosts = ({ data }: Props) => {

    var collections = {},
        years


    var edges = data.allMarkdownRemark.edges;
    edges.forEach(edge => {
        var col = {};
        var year = edge.node.fields.date.split(',')[1];
        col.categories = edge.node.frontmatter.categories;
        col.date = edge.node.fields.date;
        col.title = edge.node.frontmatter.title;
        col.slug = edge.node.fields.slug;
        collections[year] ? collections[year].push(col) : (collections[year] = [], collections[year].push(col));
    })
    years = Object.keys(collections);
    return (
        <Container css={{
            position: 'relative'
        }}>
            <div className='timeline'>
                {years.map(year => (
                    <div key={year} className='title'>
                        <h2 className='year' id={year}>
                            {year}
                        </h2>
                        <ul className='posts-ul'>
                            {collections[year].map(post => (
                                <li key={post.title} className='post-li'>
                                    <p className='post-date'>{`${post.date.substr(0, 3)} ${post.date.split(',')[0].split(' ')[1]}`}</p>
                                    <p css={{
                                        display: 'none'
                                    }} className='post-categories'>[
                                        <a
                                            href={`/categories.html#${post.categories}`}
                                            className='post-categorie'>{post.categories}</a>
                                        ]</p>
                                    <a className='post-title' href={post.slug}>{post.title}</a>
                                </li>
                            ))}
                        </ul>
                    </div>)
                )}
            </div>
        </Container>
    )
};

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query AllBlogPostsPageQuery5 {
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
