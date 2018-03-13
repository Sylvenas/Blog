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
import React, { Component } from 'react';
import { urlRoot } from 'site-constants';
import { colors, media, sharedStyles } from 'theme';
import toCommaSeparatedList from 'utils/toCommaSeparatedList';
import MetaTitle from 'templates/components/MetaTitle';

/**
 * 函数防抖，滚动事件结束之后，在执行
 * @param {Function} fn 
 * @param {Number} wait 
 * @returns {Function}
 */
const debounce = (fn, wait) => {
    let timeout = null;
    return function () {
        if (timeout !== null) {
            clearInterval(timeout)
        }
        timeout = setTimeout(fn, wait)
    }
}

let passiveEventSupported = false;
try {
    const opts = Object.defineProperty({}, 'passive', {
        get() {
            passiveEventSupported = true
        }
    })
    window.addEventListener('test', null, opts)
} catch (e) { }

const passiveEvent = passiveEventSupported ? { capture: false, passive: true } : false

class AllBlogs extends Component {
    constructor() {
        super();
        this.state = {
            flag: 1,
            noMore: ''
        }
        this.handleImgLoad = this.handleImgLoad.bind(this);
        this.handleDocScroll = this.handleDocScroll.bind(this);
        this.handleDocScroll = debounce(this.handleDocScroll, 500);
    }
    componentWillMount() {
        this.props.data.allMarkdownRemark.edges.forEach(item => {
            item.node.imgName = item.node.frontmatter.img.substring(6, 16);
            item.node.imgType = item.node.frontmatter.img.substring(17)
        })
        this.setState({
            showBlogs: this.props.data.allMarkdownRemark.edges.slice(0, 6)
        })
    }
    componentDidMount() {
        document.addEventListener('scroll', this.handleDocScroll, passiveEvent)
    }
    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleDocScroll)
    }
    handleDocScroll(event) {
        var htmlHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

        //clientHeight是网页在浏览器中的可视高度，
        var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

        //scrollTop是浏览器滚动条的top位置，
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

        //通过判断滚动条的top位置与可视网页之和与整个网页的高度是否相等来决定是否加载内容；
        if (scrollTop + clientHeight >= htmlHeight - 600) {
            if (this.state.flag * 6 >= this.props.data.allMarkdownRemark.edges.length) {
                this.setState({
                    noMore: true
                });
                return
            }
            this.setState({
                showBlogs: this.props.data.allMarkdownRemark.edges.slice(0, (this.state.flag + 1) * 6),
                flag: this.state.flag + 1
            })
        }

    }
    handleImgLoad(event) {
        this.img.style.opacity = 0;
        event.target.style.opacity = 1;
    }
    render() {
        return (<div css={{
            [media.greaterThan('medium')]: {
                width: '90%',
            },
            [media.size('xxlarge')]: {
                maxWidth: '1300px',
                margin: '0 auto'
            },
        }}>
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
                        title="Little forest - All Posts"
                    />
                    <ul
                        css={{
                            display: 'flex',
                            flexWrap: 'wrap',
                        }}>
                        {this.state.showBlogs.map(({ node }) => (
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
                                key={node.fields.slug + node.fields.date}>
                                <Link
                                    to={node.fields.slug}>
                                    <div css={{ height: 250, width: '100%', overflow: 'hidden', position: 'relative' }}>
                                        <img
                                            src={`/svg/${node.imgName}.svg`}
                                            css={{
                                                minHeight: '250px',
                                                maxWidth: '100%',
                                                position: 'relative',
                                                transition: 'opacity .3s'
                                            }}
                                            ref={img => { this.img = img }} />
                                        <picture>
                                            <source media="(min-width: 900px)"
                                                srcSet={`/img/${node.imgName}_lg_1x.webp 1x,/img/${node.imgName}_lg_2x.webp 2x`} type="image/webp" />
                                            <source media="(max-width: 900px)"
                                                srcSet={`/img/${node.imgName}_md_1x.webp 1x,/img/${node.imgName}_md_2x.webp 2x`} type="image/webp" />
                                            <img srcSet={`
                                                        /img/${node.imgName}_md_1x.${node.imgType} 900w,
                                                        /img/${node.imgName}_lg_1x.${node.imgType} 1440w`}
                                                src={`/img/${node.imgName}_lg_1x.${node.imgType} 1440w`}
                                                type={`image/${node.imgType}`}
                                                onLoad={this.handleImgLoad}
                                                alt="image"
                                                css={{
                                                    minHeight: '250px',
                                                    width: '100%',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    opacity: 0,
                                                    transition: 'opacity .3s'
                                                }}
                                                description='true' />
                                        </picture>
                                    </div>
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
                                }}><a href={`/categories.html#${node.frontmatter.categories}`}>{node.frontmatter.categories ? node.frontmatter.categories : ''}</a></h2>
                                <Link
                                    to={node.fields.slug}>
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
                                </Link>
                                <p css={{
                                    fontSize: 14,
                                    lineHeight: '27px',
                                    color: '#333c4e',
                                    padding: '0 25px',
                                    textAlign: 'center',
                                    marginTop: '30px',
                                    width: '85%',
                                    margin: '40px auto',
                                }}>{node.excerpt.length < 10 ? node.frontmatter.excerpt : node.excerpt}</p>
                            </li>
                        ))}
                    </ul>
                    {this.state.noMore ? <div css={{
                        fontSize: 14,
                        fontFamily: '"brandon-grotesque", sans-serif',
                        fontWeight: "bold",
                        color: '#7e8890',
                        textTransform: 'uppercase',
                        letterSpacing: '.075em',
                        textAlign: 'center',
                        marginBottom: '25px'
                    }}>No More</div> : null}
                </div>
            </div>
        </div>
        )
    }
}

// eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query AllBlogPostsPageQuery9 {
    allMarkdownRemark(
      filter: {id: {regex: "/blog/"}}
      sort: {fields: [fields___date], order: DESC}
    ) {
      edges {
        node {
          excerpt
          frontmatter {
            title
            author 
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

export default AllBlogs;
