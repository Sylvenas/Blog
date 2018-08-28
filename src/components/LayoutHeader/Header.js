/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import Container from 'components/Container';
import HeaderLink from './HeaderLink';
import Link from 'gatsby-link';
import React from 'react';
import { colors, fonts, media } from 'theme';
import { version } from 'site-constants';
import ExternalLinkSvg from 'templates/components/ExternalLinkSvg';
import DocSearch from './DocSearch';

const Header = ({ location }) => (
  <header
    css={{
      backgroundColor: '#252b33',
      color: colors.white,
      position: 'fixed',
      zIndex: 1,
      width: '100%',
      top: 0,
      left: 0,
    }}>
    <div css={{
      paddingLeft: 20,
      paddingRight: 20,
      marginLeft: 'auto',
      marginRight: 'auto',

      [media.greaterThan('medium')]: {
        width: '90%',
      },

      [media.size('xxlarge')]: {
        maxWidth: 900,
      },
    }} >
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: 50,
          [media.between('small', 'large')]: {
            height: 45,
          },
          [media.lessThan('small')]: {
            height: 40,
          },
        }}>
        <Link
          css={{
            display: 'flex',
            marginRight: 10,
            height: '100%',
            alignItems: 'center',
            color: colors.brand,

            ':focus': {
              outline: 0,
              color: colors.white,
            },

            [media.greaterThan('small')]: {
              width: 'calc(100% / 3)',
            },
            [media.lessThan('small')]: {
              flex: '0 0 auto',
            },
          }}
          to="/">
          <img
            css={{
              margin: 0
            }}
            src='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAZABkDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAABAUHAQYI/8QAKRAAAQMDAwMEAgMAAAAAAAAAAQIDBAAFBhESIQgxQQcTIkIUMlFhkf/EABgBAAMBAQAAAAAAAAAAAAAAAAIDBQQG/8QAHREAAgMAAwEBAAAAAAAAAAAAAQIAAxEEITESgf/aAAwDAQACEQMRAD8A9AstF5wISNSajlw6kYgyGdGs2Ov3yxwFKbkXZmRtClJ7lpO0708HnX/Kb9RkLJJ/otkzeLPli4IZS8/tcDa1xEHdIQlR7EoBHcajUA80Z0K2QYf065fmVwx+z5FG9tSZH5jwD5CVBTrRUsFLbSGilW0DVSuPAqRUikae53HP5NtR+a+vP3TmTr7De4eT2C3Xm3LUuBPZD7JcTtUAe4UPBBBBH8g0bU06d7BPtHp49MkvgwLvOdnW6KFlZjRySkJUT9iU8j+hryTVLpDAA4JUodrKwzewDIrLHyXG7vZ5aFORrhEdjLShW1RCkkcHwddOanOC+jFxtvTBlWJXl4jJptzZuVtjRXkqZbUhCUH3FHRPyG8KA1+unaqrRKf0okYrE38ZLyCx8iHDbM5jWE4/ZnkMofgQWmHRHJLfuBPzIJ5OqiTr51prWnvWUBOnZqVQqhRP/9k=' alt="" height="25" />
          <span
            css={{
              color: '#fff',
              fontFamily: '"Source Sans Pro","Helvetica Neue",Helvetica,Arial,sans-serif',
              marginLeft: 10,
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
              [media.lessThan('large')]: {
                fontSize: 16,
                marginTop: 1,
              },
              [media.lessThan('small')]: {
                // Visually hidden
                position: 'absolute',
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                height: 1,
                width: 1,
                margin: -1,
                padding: 0,
                border: 0,
              },
            }}>
            little forest
          </span>
        </Link>

        <nav
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            height: '100%',
            width: '60%',

            [media.size('xsmall')]: {
              //flexGrow: '1',
              width: 'auto',
            },
            [media.greaterThan('xlarge')]: {
              width: null,
            },
            [media.lessThan('small')]: {
              maskImage:
                'linear-gradient(to right, transparent, black 13px, black 90%, transparent)',
            },
          }}>
          <HeaderLink
            isActive={location.pathname === '/'}
            title="HOME"
            to="/"
          />
          <HeaderLink
            isActive={location.pathname.includes('/archive')}
            title="ARCHIVE"
            to="/archive.html"
          />
          <HeaderLink
            isActive={location.pathname.includes('/categories')}
            title="CATEGORIES"
            to="/categories.html"
          />
        </nav>
       

      </div>
    </div>
  </header>
);

export default Header;
