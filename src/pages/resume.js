import React from "react";
import Container from "components/Container";
import book1 from "../images/1.jpeg";
import book2 from "../images/2.jpeg";
import book3 from "../images/3.jpeg";
import book4 from "../images/4.jpeg";
import book5 from "../images/5.jpeg";
import book6 from "../images/6.jpeg";

class Resume extends React.Component {
  constructor() {
    super();
    this.state = { active: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(idx) {
    this.setState({ active: idx });
  }
  render() {
    const { active } = this.state;
    return (
      <Container
        css={{
          position: "relative"
        }}
      >
        <div
          css={{
            margin: "2em auto 1em",
            width: "100%"
          }}
        >
          <h2 className="resume-title">About</h2>
          <p className="resume-p">
            Tao Zhao lives in HangZhou, ZheJiang. He likes basketball, books,
            games and travel.
          </p>
          <br />
          <p className="resume-p">Math is my next programming language</p>
          <br />
          <p className="resume-p">
            <b>Keywords: </b>
            <span className="keywords">
              <a href="/categories.html#functional">Functional Programming</a>
            </span>
            、
            <span className="keywords">
              <a href="/categories.html#Async">Async Programming</a>
            </span>
            、
            <span className="keywords">
              <a href="/blog/2017/11/20/FP5-closure.html">Closure</a>
            </span>
            、
            <span className="keywords">
              <a href="/blog/2018/09/02/FP14-Monad-1.html">Functor/Monad</a>
            </span>
            、
            <span className="keywords">
              <a href="/categories.html#composing%20software">
                Function Compose
              </a>
            </span>
            、
            <span className="keywords">
              <a href="/categories.html#React">React/Redux</a>
            </span>
          </p>
          <Love />
          <p className="resume-p">
            I am a senior front-end developer with 6 years of experience, and a
            code-aholic, invested a lot of time in the open source community,
            developing and maintaining several projects. I love to summarize &
            share.I originally joined the Cloud Music team at NetEase in Apr
            2017, tasked to revamp the event details pages from an archaic
            MySpace-style design to a modern, fully responsive layout.
          </p>
        </div>
        <Posts handleClick={this.handleClick} active={active} />
        {active === 0 && <WorkInfo />}
        {active === 1 && <Projects />}
        {active === 2 && <Books />}
      </Container>
    );
  }
}

const Love = () => (
  <div className="love-container">
    <img
      src="https://p1.music.126.net/cApgVVmtcKYFyxunEmHCkA==/109951164540902241.jpg"
      className="resume-love"
    />
  </div>
);

const Posts = ({ active, handleClick }) => (
  <div
    css={{
      borderTop: "1px solid #efefef",
      display: "flex",
      justifyContent: "center",
      letterSpacing: "1px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: 600
    }}
  >
    <a
      css={{
        cursor: "pointer",
        lineHeight: "52px",
        marginRight: 60,
        borderTop: active == 0 ? "1px solid #262626" : "none",
        marginTop: active == 0 ? -1 : 0,
        color: active === 0 ? "#262626" : "#999"
      }}
      onClick={handleClick.bind(null, 0)}
    >
      BIO
    </a>
    <a
      css={{
        cursor: "pointer",
        lineHeight: "52px",
        marginRight: 60,
        borderTop: active == 1 ? "1px solid #262626" : "none",
        marginTop: active == 1 ? -1 : 0,
        color: active === 1 ? "#262626" : "#999"
      }}
      onClick={handleClick.bind(null, 1)}
    >
      PROJECTS
    </a>
    <a
      css={{
        cursor: "pointer",
        lineHeight: "52px",
        marginRight: 60,
        borderTop: active == 2 ? "1px solid #262626" : "none",
        marginTop: active == 2 ? -1 : 0,
        color: active === 2 ? "#262626" : "#999"
      }}
      onClick={handleClick.bind(null, 2)}
    >
      BOOKS
    </a>
  </div>
);

const WorkInfo = () => (
  <div
    css={{
      margin: "1em auto 5em"
    }}
  >
    <div className="timeline">
      <div className="title">
        <div className="year work">
          <span className="work-date">Apr 2017 - Now</span> Senior Front-end
          Developer @
          <a href="http://netease.com" target="_blank">
            NetEase
          </a>
        </div>
        <div className="year work">
          <span className="work-date">May 2013 - Apr 2017</span> Software
          Engineer @
          <a href="https://www.bilibili.com/" target="_blank">
            Bilibili
          </a>
        </div>
        {/* <div className="year work">
          <span className="work-date">July 2010 - May 2014</span> Software Developer @ <a href="http://sap.com" target="_blank">tongyan</a>
        </div> */}
      </div>
    </div>
  </div>
);
const Projects = () => (
  <div
    css={{
      margin: "1em auto 1em"
    }}
  >
    <h2 className="resume-title">Projects</h2>
    <span className="resume-sub-title">
      <a target="_blank" href="https://github.com/lit-forest/react-magic">
        react-magic
      </a>
    </span>
    <p className="resume-p">
      A collection of magic animations for react components. Although React
      provides a way to implement arbitrary animations, it is not an easy task
      to do it, even for simple animations. That's where react-magic package
      comes in. It supports inline styles work with
      <a href="https://github.com/Khan/aphrodite" target="_blank">
        {" "}
        aphrodite
      </a>
      . Most animations was implemented base on
      <a href="https://github.com/miniMAC/magic" target="_blank">
        {" "}
        magic
      </a>
      .
    </p>
    <span className="resume-sub-title">
      <a target="_blank" href="https://github.com/x-orpheus/catch-react-error">
        catch-react-error
      </a>
    </span>
    <p className="resume-p">
      <p>This package supports both React And React Native.</p>

      <p>This project make it easy to protect your react source code.</p>

      <p>We combine decorators and React Error Boundaries together.</p>

      <p>
        The React Error Boundaries don't support the Server Side Rendering，so
        we use try/catch to deal such condition.
      </p>
    </p>
    <span className="resume-sub-title">
      <a
        target="_blank"
        href="https://github.com/lit-forest/leaflet.migrationLayer"
      >
        leaflet.migrationLayer
      </a>
    </span>
    <p className="resume-p">
      leafet.migrationLayer is used to show migration data such as
      population,flight,vehicle,traffic and so on.Data visualization on map.
    </p>
  </div>
);

const BOOKS = [book1, book2, book3, book4, book5, book6];

const Books = () => (
  <div
    css={{
      display: "flex",
      flexWrap: "wrap"
    }}
  >
    {BOOKS.map((book, idx) => (
      <img
        key={idx}
        src={book}
        css={{
          height: 200,
          width: 150,
          margin: 10
        }}
      />
    ))}
  </div>
);

export default Resume;
