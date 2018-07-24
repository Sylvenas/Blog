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
              margin:0
            }}
            src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAxBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkVCMzIzMzQyNkEyMTFFOEFDMDg5QzEyQjZBQkVFQzAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkVCMzIzMzMyNkEyMTFFOEFDMDg5QzEyQjZBQkVFQzAiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiBXaW5kb3dzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9IjUzNDQzMkUwNjJCQjgxQzkzOTBCNzEzODY2NjFDMDJFIiBzdFJlZjpkb2N1bWVudElEPSI1MzQ0MzJFMDYyQkI4MUM5MzkwQjcxMzg2NjYxQzAyRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjsnVbAAAAXeSURBVHjaPJVrb+PGFYaHnOGdFClSlCxb2nbXTnfdC3pLsb+gCIp+6S8M0N+QTwWCFgWay2azdS5AkrXXK61ly7Ik3snhbTjsUVp09EEEwZk557zPeY/w8acXSDj8/r+wIOIeNYy1rPnnP/7Oe9a27P7uRpLl28Vy6LpZlm23W8dxRpNxTqk7HM5nj7GIiEwkzrmA/ncY/BGM8zxbLRdtx95c/XB6drpYXHUtcyTJdhw4KApD1KMsTRljhmXlWR7uN/BGvFutOsbE/y5BkCXpfr1++cVny+X1d19f2Ka5XLzNkqxnXVvVsFlRVd8fd7zrWAc33757RwjWLQPSwI7rzo6nE39yv75b3S6apnnx6b8296s8TTnvmrYJg0Aih0XzIggC0zJ2u11VVaZlRXEoirhjTRbHSZKS3f5hv9uePT3/6tuLzd1K1fU0iljdJGmsmRY8ZHE6nZ0UeS4SLGJx8XaBMZ7P53lREFEsq8oazLumgUjx2XtP+SH5+NXLLwxVY00NtWva1nW9uqxW7256oacFLcsyiiLbtjmHT+qiKKBep6dncK6AOMGSrMh46I2g5JBgniSDwQAhtN3uoC684wUteM+zLNd1vW6aPMs0TYNiSZJ8NJ3gHxOHLbPZvChL0Br/8YM/+Z7HGRsMHSyKwX7P+x6ujeII7pRlGWKxLMtxh7pusK4L9wEom6Sp2AtXry+RINrDw7pZvhMnkwnBhCMU7LZVSQ3ThMshLkmSiCQBAf2PR7+9fOMMBk8eP6Ylvby8DPbB9dWVqqrPfn6OUMfa5vHpE0KLnHUc+Dw6moIooONms2nbFvISBVTX9Xp99/TZOeJ9mqbffPW1ZRh5lECCQ8+bzWYVLU3LBAWgmqQsSoRF3TKBQw7AAeac7x8eBNQvrq9lWf3Jo0dJFEGx8jzvOW+7DiRTsAINIKvKm9evR0dHgoh4wwgcBNwDn0kci1gIw+BocjyZjEEBRdFczy2rGmpU07Jum5PjY5GQ3cM2TRLbdfa7vWEaeZpAcmVO8bNnv9AUFdgReuQ6zn4bJFEMIeRZ6gyHkBe0Q1lS0FeVlbKgcZ6CfJKipGkmcO6OPGg/JKI8S4ikq2ESed5IkeUOIXfsZ0lKs6zIi0P56hrOapuWt62k66Zte6Mx9M/t7S3vBVDs5mZ1Mp+ppt7SmuiKigFO1haU+r4PEPzw/fcKIZPp9Hfvv+97Y4wlTVOtwQCaRtW0zz//5G8ffdTQom4ZKzEAUaR5zZr1/ZqA3gA64gwEhvbTVO358+e/+s2vf/v7P5imifoe9Ye46rra3N//9cMPv/n2Atqj63v4sirLvuuqurIcG24ioEVFK1VRDs4lkdFg8Mvz87bnr778LIsSKFsYRk3dQOc8PGwEJL335CylUJykphXotodutwdYxtDtBBwPqATuJU3tUBdGIQC1221530b7GCGMieiPRyImumaoqtxxwdM8SCLa7iDLCmRuaqu3wCkJIA56+54L8K4Wa1bXYDVd20LJJVGAJyLK65ulIiuSoo6PZy9fvOg7pBkGUZUioIoiA3E9FquqJNA0kAJoX5b5crnECKzS2GwSGSyO4IFpgO1GQTg9PgZHqKt8YJiM9SUtvYnf1jTaRbppKgdIJOKYxmETRvGOT/zxdDqmddV2kJGCRUHV9LaqNFWKorB9aCtKm6Zyh/7A0hRNFW07DhIYD6quOY5Fjh890k0rjHb+eHLyUzr2xxCjLH8XBJsiCMs4NOyBZTu0gmHSAYOua0cBBBp5kxOQxhk5YCGSTABsAgB2TTXQbdnRshwGzINpaB/8+S/wHAcRhGYYpqIoYEFRuAN6IBdKq/0+GA6hf9Hd3R0w29ZQ7ZYsrq+G7kiW9DQNCBFNQwcPiKMYxB35E+hQ4Au8dARhT6fQ16A7+NpTkIUBZPzsZ+dFkf/71UXAETEMD0yxpAnMs44JIDCjFEwVhhLsAVbBf4BlSZYOEw8JsB8cDcHI6hE4BogOJHhDfz4/+Y8AAwB2UbMMsjeTIwAAAABJRU5ErkJggg==' alt="" height="25" />
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
          <HeaderLink
            isActive={location.pathname.includes('/resume')}
            title="RESUME"
            to="/resume"
          />
        </nav>
        <DocSearch />
        <div
          css={{
            [media.lessThan('medium')]: {
              display: 'none',
            },
            [media.greaterThan('large')]: {
              width: 'calc(100% / 6)',
            },
          }}>

          <a
            css={{
              padding: '5px 10px',
              marginLeft: 10,
              whiteSpace: 'nowrap',
              ...fonts.mid,

              ':hover': {
                color: colors.brand,
              },

              ':focus': {
                outline: 0,
                backgroundColor: colors.lighter,
                borderRadius: 15,
              },
            }}
            href="https://twitter.com/MelloZhao"
            target="_blank"
            rel="noopener">
            <i className="icon-twitter"></i>
          </a>
          <a
            css={{
              padding: '5px 10px',
              marginLeft: 10,
              whiteSpace: 'nowrap',
              ...fonts.small,

              ':hover': {
                color: colors.brand,
              },

              ':focus': {
                outline: 0,
                backgroundColor: colors.lighter,
                borderRadius: 15,
              },
            }}
            href="mailto:wrsden@gmail.com?subject=little forest"
            target="_blank"
            rel="noopener">
            <i className="icon-brand"></i>
          </a>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
