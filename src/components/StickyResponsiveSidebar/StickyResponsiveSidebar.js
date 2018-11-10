/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import {Component, React} from 'react';
import Sidebar from 'templates/components/Sidebar';
import {colors, media} from 'theme';

class StickyResponsiveSidebar extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
    };
    this._openNavMenu = this._openNavMenu.bind(this);
    this._closeNavMenu = this._closeNavMenu.bind(this);
  }

  _openNavMenu() {
    this.setState({open: !this.state.open});
  }

  _closeNavMenu() {
    this.setState({open: false});
  }

  render() {
    const {open} = this.state;
    const smallScreenSidebarStyles = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      position: 'fixed',
      backgroundColor: colors.white,
      zIndex: 2,
      height: '100vh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      pointerEvents: open ? 'auto' : 'none',
    };

    const menuOpacity = open ? 1 : 0;
    const menuOffset = open ? 0 : 40;

    // TODO: role and aria props for 'close' button?
    return (
      <div
        style={{
          opacity: menuOpacity,
          transition: 'opacity 0.5s ease',
        }}
        css={{
          [media.lessThan('small')]: smallScreenSidebarStyles,

          [media.greaterThan('medium')]: {
            marginRight: -999,
            paddingRight: 999,
            // backgroundColor: '#f7f7f7',
          },

          [media.between('medium', 'sidebarFixed', true)]: {
            position: 'fixed',
            zIndex: 2,
            height: '100%',
          },

          [media.greaterThan('small')]: {
            position: 'fixed',
            zIndex: 2,
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            marginRight: -999,
            paddingRight: 999,
            // backgroundColor: '#f7f7f7',
            opacity: '1 !important',
          },

          [media.size('small')]: {
            height: 'calc(100vh - 40px)',
          },

          [media.between('medium', 'large')]: {
            height: 'calc(100vh - 50px)',
          },

          [media.greaterThan('sidebarFixed')]: {
            // borderLeft: '1px solid #ececec',
          },
        }}>
        <div
          style={{
            transform: `translate(0px, ${menuOffset}px)`,
            transition: 'transform 0.5s ease',
          }}
          css={{
            marginTop: 60,

            [media.size('xsmall')]: {
              marginTop: 40,
            },

            [media.between('small', 'medium')]: {
              marginTop: 0,
            },

            [media.between('medium', 'large')]: {
              marginTop: 50,
            },

            [media.greaterThan('small')]: {
              transform: 'none !important',
            },
          }}>
          <Sidebar closeParentMenu={this._closeNavMenu} {...this.props} />
        </div>
      </div>
    );
  }
}

export default StickyResponsiveSidebar;
