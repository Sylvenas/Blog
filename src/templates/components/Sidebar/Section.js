/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 */

'use strict';

import React from 'react';
import { media } from 'theme';

const Section = ({
  createLink,
  location,
  onLinkClick,
  section,
}) => (
  <div css={{
    marginBottom: 10,
    [media.greaterThan('small')]: {
      display: 'block',
    },
  }}>
    {createLink({
      section,
      location,
      onLinkClick,
    })}
  </div>
);

export default Section;
