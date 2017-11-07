/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import Link from 'gatsby-link';
import React from 'react';
import { colors, media } from 'theme';

const HeaderLink = ({ isActive, title, to }) => (
  <Link css={[style, isActive && activeStyle]} to={to}>
    {title}
    {isActive && <span css={activeAfterStyle} />}
  </Link>
);

const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  color: colors.white,
  transition: 'color 0.2s ease-out',
  paddingLeft: 15,
  paddingRight: 15,
  fontWeight: 400,
  fontFamily: 'brandon-grotesque',

  ':focus': {
    outline: 0,
    backgroundColor: colors.lighter,
    color: colors.white,
  },

  [media.size('xsmall')]: {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 14,
  },

  [media.between('small', 'medium')]: {
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
  },

  [media.greaterThan('xlarge')]: {
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 13,

    ':hover:not(:focus)': {
      color: colors.lightRed,
    },
  },
};

const activeStyle = {
  color: colors.lightRed,

  [media.greaterThan('small')]: {
    position: 'relative',
  },
};

const activeAfterStyle = {
  [media.greaterThan('small')]: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    background: colors.lightRed,
    left: 0,
    right: 0,
    zIndex: 1,
  },
};

export default HeaderLink;
