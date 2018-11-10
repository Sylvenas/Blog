import React from 'react';

const Share = ({ slug }: { slug: string }) => (
  <div css={{
    marginTop: 80,
    borderTop: '1px solid #abb0b7',
    paddingTop: '20px',
  }}>
    <p css={{ fontSize: '.8rem', marginBottom: 20 }}>SHARE ON:</p>
    <ul css={{ margin: 0, padding: 0 }}>
      <li css={{ display: 'inline-block', marginRight: '0.5em' }}>
        <a
          css={{
            padding: '8px 17px',
            border: '1px solid #abb0b7',
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 400,
            color: '#333',
            transition: 'all .2s',
            ':hover': {
              backgroundColor: '#55acee',
              color: '#fff',
            },
          }}
          target="_blank"
          href={`https://twitter.com/intent/tweet?text=http://lit-forest.github.io${slug}`}>
          <i className="icon-twitter"></i>
          <span css={{ display: 'none' }} className="share">Twitter</span>
        </a>
      </li>
      <li css={{ display: 'inline-block', marginRight: '0.5em' }}>
        <a
          css={{
            padding: '8px 17px',
            border: '1px solid #abb0b7',
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 400,
            color: '#333',
            transition: 'all .2s',
            ':hover': {
              backgroundColor: '#3b5998',
              color: '#fff',
            },
          }}
          target="_blank"
          href={`https://www.facebook.com/sharer/sharer.php?u=http://lit-forest.github.io${slug}`}>
          <i className="icon-facebook"></i>
          <span css={{ display: 'none' }} className="share">Facebook</span>
        </a>
      </li>
      <li css={{ display: 'inline-block', marginRight: '0.5em' }}>
        <a
          css={{
            padding: '8px 17px',
            border: '1px solid #abb0b7',
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 400,
            color: '#333',
            transition: 'all .2s',
            ':hover': {
              backgroundColor: '#dd4b39',
              color: '#fff',
            },
          }}
          target="_blank"
          href={`https://plus.google.com/share?url=http://lit-forest.github.io${slug}`}>
          <i className="icon-google-plus"></i>
          <span css={{ display: 'none' }} className="share">Google+</span>
        </a>
      </li>
      <li css={{ display: 'inline-block', marginRight: '0.5em' }}>
        <a
          css={{
            padding: '8px 17px',
            border: '1px solid #abb0b7',
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 400,
            color: '#333',
            transition: 'all .2s',
            ':hover': {
              backgroundColor: '#0976b4',
              color: '#fff',
            },
          }}
          target="_blank"
          href={`https://www.reddit.com/submit?url=http://lit-forest.github.io${slug}`}>
          <i className="icon-reddit"></i>
          <span css={{ display: 'none' }} className="share">Reddit</span>
        </a>
      </li>
    </ul>
  </div>
);

export default Share;