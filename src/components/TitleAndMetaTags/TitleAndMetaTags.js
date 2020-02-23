/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * @emails react-core
 * @flow
 */

'use strict';

import Helmet from 'react-helmet';
import React from 'react';

const defaultDescription = 'Little Forset Blog - ';

type Props = {
  title: string,
  ogDescription: string,
  ogUrl: string,
};

const TitleAndMetaTags = ({ title, ogDescription, ogUrl }: Props) => {
  return (
    <Helmet title={title}>
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:image" content="/logo-og.png" />
      <meta
        property="og:description"
        content={defaultDescription + ogDescription}
      />
      <meta property="fb:app_id" content="623268441017527" />
      <script type="application/ld+json">{`
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?128683c0ba41f92f130e92ac9620d31b";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
    `}</script>
    </Helmet>
  );
};

export default TitleAndMetaTags;
