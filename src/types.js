/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 * @flow
 */

export type Author = {
  name: string,
};

export type Node = {
  excerpt: string,
  fields: {
    date: string,
    path: string,
    redirect: string,
    slug: string,
  },
  frontmatter: {
    author?: Array<string>,
    next?: string,
    prev?: string,
    title: string,
    excerpt?: string,
    categories?: string,
    id?: string,
    img?: string
  },
  html: string,
  id: string,
};

export type Edge = {
  node: Node,
};

export type allMarkdownRemarkData = {
  allMarkdownRemark: {
    edges: Array<Edge>,
  },
};

export type markdownRemarkData = Node;