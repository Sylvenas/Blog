import React from 'react';
import Container from 'components/Container';
import love from '../images/love.jpg';
const Resume = () => {
    return (
        <Container css={{
            position: 'relative'
        }}>
            <div css={{
                margin: '2em auto 1em'
            }}>
                <h2 className='resume-title'>About</h2>
                <p className='resume-p'>Mello is a holy buddhist, a husband. He lives in HangZhou, ZheJiang with his wife Tyran.</p>
                <img src={love} className='resume-love' />
                <p className='resume-p'>
                    Mello is currently a Fontend developer engineer and manager of the Fontend Platform team at
                    <a href='http://netease.com' target='_blank'> NetEase</a>. He originally joined the Listings team at NetEase in Apr 2017, tasked to revamp the event details pages from an archaic MySpace-style design to a modern, fully responsive layout.
                </p>
            </div>
            <div css={{
                margin: '2em auto 1em'
            }}>
                <h2 className='resume-title'>Projects</h2>
                <span className='resume-sub-title'>react-magic</span>
                <p className='resume-p'>
                    A collection of magic animations for react components. Although React provides a way to implement arbitrary animations, it is not an easy task to do it, even for simple animations. That's where react-magic package comes in. It supports inline styles work with
                    <a href='https://github.com/Khan/aphrodite' target='_blank'> aphrodite</a>. Most animations was implemented base on
                    <a href='https://github.com/miniMAC/magic' target='_blank'> magic</a>.
                </p>
                <span className='resume-sub-title'>leaflet.migrationLayer</span>
                <p className='resume-p'>
                    leafet.migrationLayer is used to show migration data such as population,flight,vehicle,traffic and so on.Data visualization on map.
                </p>
            </div>
            <div css={{
                margin: '2em auto 5em'
            }}>
                <h2 className='resume-title'>Bio</h2>
                <div className='timeline'>
                    <div className='title'>
                        <div className='year work'>
                            <span className='work-date'>Apr 2017 - Now</span> Fontend Developer @ <a href='http://netease.com' target='_blank'>NetEase</a></div>
                        <div className='year work'>
                            <span className='work-date'>May 2014 - Apr 2017</span> Web Assistant @ <a href='https://facebook.com' target='_blank'>Facebook</a></div>
                        <div className='year work'>
                            <span className='work-date'>July 2010 - May 2014</span> Software Developer @ <a href='http://sap.com' target='_blank'>SAP</a></div>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default Resume;