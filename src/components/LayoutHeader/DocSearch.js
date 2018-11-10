/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

import React, {Component} from 'react';
import {colors, media, fonts} from 'theme';

class DocSearch extends Component {
  state = {
    enabled: true,
  };
  render() {
    const {enabled} = this.state;

    return enabled ? (
      <div
        css={{
          display: 'flex',
          flex: '0 0 auto',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          fontSize:15,
          cursor: 'pointer',
          [media.lessThan('small')]: {
            justifyContent: 'flex-end',
          },
          [media.lessThan('large')]: {
            marginRight: 10,
          },
          [media.between('small', 'medium')]: {
            width: 'calc(100% / 3)',
          },
          [media.between('medium', 'xlarge')]: {
            width: 'calc(100% / 6)',
          },
          [media.greaterThan('small')]: {
            minWidth: 20,
          },
        }}>
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
          href="https://github.com/lit-forest"
          target="_blank"
          rel="noopener">
          <i className="icon-github"></i>
        </a>
      </div>
    ) : null;
  }
}

export default DocSearch;
