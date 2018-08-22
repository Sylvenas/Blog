/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @providesModule theme
 * @flow
 */

'use strict';

/**
 * Theme contains variables shared by styles of multiple components.
 */

import hex2rgba from 'hex2rgba';

const colors = {
  lighter: '#373940', // light blue
  dark: '#282c34', // dark blue
  darker: '#20232a', // really dark blue
  brand: '#61dafb', // electric blue
  brandLight: '#bbeffd',
  text: '#1a1a1a', // very dark grey / black substitute
  subtle: '#6d6d6d', // light grey for text
  subtleOnDark: '#999',
  divider: '#ececec', // very light grey
  note: '#ffe564', // yellow
  error: '#ff6464', // yellow
  white: '#ffffff',
  black: '#000000',
  lightRed: '#f36'
};

const SIZES = {
  xsmall: { min: 0, max: 599 },
  small: { min: 600, max: 779 },
  medium: { min: 780, max: 979 },
  large: { min: 980, max: 1279 },
  xlarge: { min: 1280, max: 1339 },
  xxlarge: { min: 1340, max: Infinity },

  // Sidebar/nav related tweakpoints
  largerSidebar: { min: 1100, max: 1339 },
  sidebarFixed: { min: 2000, max: Infinity },
};

type Size = $Keys<typeof SIZES>;

const media = {
  between(smallKey: Size, largeKey: Size, excludeLarge: boolean = false) {
    if (excludeLarge) {
      return `@media (min-width: ${SIZES[smallKey]
        .min}px) and (max-width: ${SIZES[largeKey].min - 1}px)`;
    } else {
      if (SIZES[largeKey].max === Infinity) {
        return `@media (min-width: ${SIZES[smallKey].min}px)`;
      } else {
        return `@media (min-width: ${SIZES[smallKey]
          .min}px) and (max-width: ${SIZES[largeKey].max}px)`;
      }
    }
  },

  greaterThan(key: Size) {
    return `@media (min-width: ${SIZES[key].min}px)`;
  },

  lessThan(key: Size) {
    return `@media (max-width: ${SIZES[key].min - 1}px)`;
  },

  size(key: Size) {
    const size = SIZES[key];

    if (size.min == null) {
      return media.lessThan(key);
    } else if (size.max == null) {
      return media.greaterThan(key);
    } else {
      return media.between(key, key);
    }
  },
};

const fonts = {
  header: {
    [media.lessThan('medium')]: {
      fontSize: 40,
      lineHeight: '45px',
    },
  },
  small: {
    fontSize: 14,
  },
  mid: {
    fontSize: 15
  }
};

// Shared styles are generally better as components,
// Except when they must be used within nested CSS selectors.
// This is the case for eg markdown content.
const linkStyle = {
  //backgroundColor: hex2rgba(colors.brandLight, 0.5),
  //borderBottom: `1px solid ${hex2rgba(colors.black, 0.2)}`,
  color: '#2f7bbd',
  transition: 'color .3s',
  borderBottom: '1px dotted rgba(64, 153, 255, .6)',
  ':hover': {
    //backgroundColor: colors.brandLight,
    //borderBottomColor: colors.text,
    color: '#f36'
  },
};
const sharedStyles = {
  link: linkStyle,

  articleLayout: {
    container: {
      display: 'flex',
      minHeight: 'calc(100vh - 60px)',
      [media.greaterThan('sidebarFixed')]: {
        maxWidth: 840,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    },
    content: {
      marginTop: 40,
      marginBottom: 120,

      [media.greaterThan('medium')]: {
        marginTop: 50,
      },
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',

      [media.between('small', 'sidebarFixed')]: {
        borderLeft: '1px solid #ececec',
        marginLeft: 80,
      },

      [media.between('small', 'largerSidebar')]: {
        flex: '0 0 200px',
        marginLeft: 80,
      },

      [media.between('small', 'medium')]: {
        marginLeft: 40,
      },

      [media.greaterThan('largerSidebar')]: {
        flex: '0 0 300px',
      },

      [media.greaterThan('sidebarFixed')]: {
        position: 'fixed',
        right: 0,
        width: 300,
        zIndex: 2,
      },
    },

    editLink: {
      color: colors.subtle,
      borderColor: colors.divider,
      transition: 'all 0.2s ease',
      transitionPropery: 'color, border-color',
      whiteSpace: 'nowrap',
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',

      ':hover': {
        color: colors.text,
        borderColor: colors.text,
      },
    },
  },

  markdown: {
    lineHeight: '25px',
    'p > img': {
      display: 'inlineblock',
      margin: '0 auto'
    },
    '& .gatsby-highlight': {
      marginTop: 25,
      marginLeft: -30,
      marginRight: -30,
      marginBottom: 25,
      paddingLeft: 15,
      paddingRight: 15,

      [media.lessThan('small')]: {
        marginLeft: -20,
        marginRight: -20,
        borderRadius: 0,
      },
    },

    '& a:not(.anchor):not(.gatsby-resp-image-link)': linkStyle,

    '& > p:first-child': {
      // fontSize: 15,
      // color: colors.subtle,

      // [media.greaterThan('xlarge')]: {
      //   fontSize: 16,
      // },

      // '& a, & strong': {
      //   fontWeight: 600,
      //   color: '#323a45'
      // },
    },
    '& table': {
      //margin: '10px',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      '& th': {
        fontSize: 15,
        color: '#323a45',
        background: '#F3F3F3',
        border: '1px solid #E6E6E6',
        padding: '5px 8px'
      },
      '& td': {
        border: '1px solid #E6E6E6',
        padding: '5px 8px'
      }
    },
    '& strong': {
      fontWeight: 600,
      fontSize: 15,
      color: '#323a45',
    },
    '& p': {
      marginTop: 30,
      color: '#333',
      fontSize: 16,
      lineHeight: 1.9,
      // maxWidth: '42em',

      '&:first-of-type': {
        marginTop: 15,
      },

      '&:first-child': {
        marginTop: 0,
      },

      [media.lessThan('large')]: {
        fontSize: 16,
        marginTop: 25,
      },
    },

    '& h3 + p, & h3 + p:first-of-type': {
      marginTop: 20,
    },

    '& p > code, & li > code': {
      //background: hex2rgba(colors.note, 0.3),
      padding: '0 3px',
      fontSize: 'inherit',
      //color: '#f36',
      wordBreak: 'break-word',
      fontFamily: '"Open Sans", "open-sans", sans-serif',
      background: 'rgba(0, 0, 0, .05)',
      margin: '0 3px',
      borderRadius: '3px'
    },

    '& hr': {
      height: 1,
      marginBottom: -1,
      border: 'none',
      borderBottom: `1px solid ${colors.divider}`,
      marginTop: 40,

      ':first-child': {
        marginTop: 0,
      },
    },

    '& h1': {
      lineHeight: 1.2,

      [media.size('xsmall')]: {
        fontSize: 30,
      },

      [media.between('small', 'large')]: {
        fontSize: 45,
      },

      [media.greaterThan('xlarge')]: {
        fontSize: 60,
      },
    },

    '& h2': {
      borderTop: `1px solid ${colors.divider}`,
      marginTop: 44,
      paddingTop: 40,
      lineHeight: 1.2,

      ':first-child': {
        borderTop: 0,
        marginTop: 0,
        paddingTop: 0,
      },

      [media.lessThan('large')]: {
        fontSize: 20,
      },
      [media.greaterThan('xlarge')]: {
        fontSize: 35,
      },
    },

    '& hr + h2': {
      borderTop: 0,
      marginTop: 0,
    },

    '& h3': {
      paddingTop: 45,
      color: '#323a45',
      fontWeight: 600,
      [media.greaterThan('xlarge')]: {
        fontSize: 18,
        lineHeight: 1.3,
      },
    },

    '& h2 + h3, & h2 + h3:first-of-type': {
      paddingTop: 30,
    },

    '& h4': {
      fontSize: 16,
      color: '#323a45',
      lineHeight: 1.3,
      marginTop: 50,
      // fontWeight: 500,
    },
    '& h5': {
      fontSize: 16,
      color: '#323a45',
      lineHeight: 1.3,
      marginTop: 20,
      fontWeight: 500,
    },
    '& h4 + p': {
      marginTop: 20,
    },
    '& h5 + p': {
      marginTop: 20,
    },
    '& ol, & ul': {
      marginTop: 20,
      fontSize: 16,
      color: colors.text,
      paddingLeft: 20,

      '& p, & p:first-of-type': {
        fontSize: 16,
        marginTop: 0,
        lineHeight: 1.9,
      },

      '& li': {
        marginTop: 20,
      },

      '& li.button-newapp': {
        marginTop: 0,
      },

      '& ol, & ul': {
        marginLeft: 20,
      },
    },

    '& img': {
      maxWidth: '100%',
    },

    '& ol': {
      listStyle: 'decimal',
    },

    '& ul': {
      listStyle: 'disc',
    },

    '& blockquote': {
      //backgroundColor: hex2rgba('#ffe564', 0.3),
      borderLeftColor: '#333',
      borderLeftWidth: 3,
      borderLeftStyle: 'solid',
      fontStyle: 'italic',
      //padding: '20px 45px 20px 26px',
      padding: '0 29px 0 20px',
      marginBottom: 30,
      marginTop: 20,
      marginLeft: -30,
      marginRight: -30,

      [media.lessThan('small')]: {
        marginLeft: -20,
        marginRight: -20,
      },

      '& p': {
        marginTop: 15,

        '&:first-of-type': {
          fontWeight: 400,
          marginLeft: 7,
        },

        '&:nth-of-type(2)': {
          marginTop: 0,
        },
      },
    },

    '& .gatsby-highlight + blockquote': {
      marginTop: 40,
    },
  },
};

export { colors, fonts, media, sharedStyles };
