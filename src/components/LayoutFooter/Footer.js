/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import Container from 'components/Container';
import ExternalFooterLink from './ExternalFooterLink';
import FooterLink from './FooterLink';
import FooterNav from './FooterNav';
import MetaTitle from 'templates/components/MetaTitle';
import React from 'react';
import { colors, media } from 'theme';

import ossLogoPng from 'images/oss_logo.png';

const Footer = ({ layoutHasSidebar = false }) => (
  <footer
    css={{
      backgroundColor: '#252b33',
      color: colors.white,
      paddingTop: 0,
      paddingBottom: 20,

      [media.size('sidebarFixed')]: {
        paddingTop: 40,
      },
    }}>
    <Container>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',

          [media.between('small', 'medium')]: {
            paddingRight: layoutHasSidebar ? 240 : null,
          },

          [media.between('large', 'largerSidebar')]: {
            paddingRight: layoutHasSidebar ? 280 : null,
          },
          [media.between('largerSidebar', 'sidebarFixed', true)]: {
            paddingRight: layoutHasSidebar ? 380 : null,
          },
        }}>
        <section
          css={{
            paddingTop: 20,
            display: 'block !important', // Override 'Installation' <style> specifics

            [media.greaterThan('xlarge')]: {
              width: 'calc(100% / 2)',
              order: -1,
            },
            [media.greaterThan('large')]: {
              order: -1,
              width: layoutHasSidebar ? null : 'calc(100% / 3)',
            },
            [media.lessThan('large')]: {
              textAlign: 'center',
              width: '100%',
              paddingTop: 40,
            },
          }}>
          Ask me anything!
            <a
            css={{
              marginLeft: 20,
              padding: '6px 17px',
              border: '1px solid #f36',
              borderRadius: 3,
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              transition: 'all .2s ease-in-out',
              background: '#f36',
              ':hover': {
                background: '#252b33',
                border: '1px solid #f36',
                color: '#f36'
              }
            }}
            target="_blank"
            href={`https://github.com/lit-forest/lit-forest.github.io/issues/new`}>
            Issues
            </a>
          <p
            css={{
              color: '#fff',
              paddingTop: 25,
            }}>
            Copyright © 2017 Little Forest.
          </p>
        </section>
      </div>
    </Container>
  </footer>
);

export default Footer;
