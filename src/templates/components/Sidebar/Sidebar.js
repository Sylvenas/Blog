/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import React, {Component} from 'react';
import Flex from 'components/Flex';
import Section from './Section';
import ScrollSyncSection from './ScrollSyncSection';
import {media} from 'theme';

class Sidebar extends Component {

  render() {
    const {
      closeParentMenu,
      createLink,
      enableScrollSync,
      location,
      sectionList,
    } = this.props;

    const SectionComponent = enableScrollSync ? ScrollSyncSection : Section;

    return (
      <Flex
        type="nav"
        direction="column"
        halign="stretch"
        css={{
          width: '100%',
          paddingLeft: 20,
          position: 'relative',
          fontSize:13,

          [media.greaterThan('largerSidebar')]: {
            paddingLeft: 40,
          },

          [media.lessThan('small')]: {
            paddingBottom: 100,
          },
        }}>
        <h3 css={{
          fontFamily: 'brandon-grotesque',
          marginBottom: 5,
          fontWeight: 400,
          fontSize: 14,
          display: sectionList.length ? 'block' : 'none',
        }}>CATALOGUE</h3>
        {sectionList.map((section, index) => (
          <SectionComponent
            createLink={createLink}
            key={index}
            location={location}
            onLinkClick={closeParentMenu}
            onSectionTitleClick={() => this._toggleSection(section)}
            section={section}
          />
        ))}
      </Flex>
    );
  }

  _toggleSection(section) {
    this.setState(state => ({
      activeSection: state.activeSection === section ? null : section,
    }));
  }
}

export default Sidebar;
