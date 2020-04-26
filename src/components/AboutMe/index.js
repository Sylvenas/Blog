// import React from 'react';
// import './index.css';

// export default () => (
//   <div className="about-me">
//     <img src="https://p1.music.126.net/zSKDVZtAkjf2fLs3dlraKw==/109951164939996801.png"/>
//     <img src="https://p1.music.126.net/zSKDVZtAkjf2fLs3dlraKw==/109951164939996801.png"/>
//     <img src="https://p1.music.126.net/zSKDVZtAkjf2fLs3dlraKw==/109951164939996801.png"/>
//   </div>
// );

import React from 'react';

const Share = () => (
  <div css={{
    marginTop: 30,
    // borderTop: '1px solid #abb0b7',
    paddingTop: '10px',
  }}>
    <p css={{ fontSize: '.8rem', marginBottom: 10 }}>ABOUT ME:</p>
    <ul css={{ margin: 0, padding: 0 }}>
      <li css={{ display: 'inline-block', marginRight: '0.5em' }}>
        <img
          src="https://p1.music.126.net/zSKDVZtAkjf2fLs3dlraKw==/109951164939996801.png"
          css={{
            height:109,
            width:109,
            padding: '8px 8px',
            border: '1px solid #abb0b7',
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 400,
            color: '#333',
          }}>
        </img>
        <p css={{
          fontSize: '.6rem', textAlign:'center', marginTop: 5,
        }}>微信联系</p>
      </li>
      <li css={{ display: 'inline-block', marginRight: '0.5em' }}>
        <img
          src="https://p1.music.126.net/-xttfMEUn532VeVy6bv9pg==/109951164940043034.png"
          css={{
            height:109,
            width:109,
            padding: '8px 8px',
            border: '1px solid #abb0b7',
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 400,
            color: '#333',
          }}>
        </img>
        <p css={{
          fontSize: '.6rem', textAlign:'center', marginTop: 5,
        }}>微信打赏支持</p>
      </li>
    </ul>
  </div>
);

export default Share;