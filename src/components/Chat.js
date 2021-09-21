import React, { useEffect, useState, useRef } from 'react'
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import firebase from '../firebase.js';
import TimeAgo from 'react-timeago';
import FadeIn from 'react-fade-in';

export default function Chat() {
  const { currentUser } = useAuth();
  const contentRef = useRef();
  const chatsRef = useRef();
  const [chats, setChats] = useState([]);
  const [writeError, setWriteError] = useState(null);
  const db = firebase.firestore();
  console.log(chats)
  const chatStyle = {
    paddingLeft: '10px',
    height: '440px',
    overflowY: 'scroll',
    backgroundColor: 'lightGrey',
    textAlign: 'left',
    backgroundImage: `url('https://i.imgur.com/bWdSEgg.jpg')`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  }

  const inputStyle = {
    display: "inline-block",
    width: "75%",
    marginTop: "10px"
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await firebase.database().ref('chats').push({
        content: contentRef.current.value,
        timestamp: Date.now(),
        uid: currentUser.uid,
        username: currentUser.displayName,
        photoURL: currentUser.photoURL
      })
      document.getElementById('message').value = '';
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    } catch (error) {
      setWriteError(error.message);
    }
  }

  useEffect(() => {
    firebase.database().ref('chats').on('value', snapshot => {
      let chats = [];
      snapshot.forEach(snap => {
        chats.push(snap.val());
      });
      setChats(chats);
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    })
  }, [])

  return (
    <div>
      <div className="chats" style={chatStyle} ref={chatsRef}>
        {chats.map(chat => {
          return <div key={chat.timestamp} style={{marginBottom: "20px"}}>
            <FadeIn>
            <Container>
              <Row>
                <Col xs={2} style={{paddingLeft: "0px"}}>
                  <img 
                    src={chat.photoURL} 
                    id="icon" 
                    style={{width: "40px", display: "inline-block", borderRadius: "5px"}}
                  />
                </Col>
                <Col xs={10} style={{padding: "0px"}}>
                  <strong style={{verticalAlign: "top"}}>@{chat.username}</strong> • 
                  <span className="text-muted">
                    <TimeAgo date={chat.timestamp}/>
                  </span>
                  <p style={{verticalAlign: "top"}}> {chat.content}</p>
                </Col>
              </Row>
            </Container>
            </FadeIn>
          </div>
        })}
      </div>
      <Form onSubmit={handleSubmit}>
        <Form.Group id="username">
          <Form.Control 
            type="text" 
            ref={contentRef} 
            placeholder="Say something..." 
            required 
            id="message" 
            style={inputStyle}/>
          <Button variant="success" type="submit" id="button">Send</Button>
        </Form.Group>
      </Form>
      {writeError ? <p>{writeError}</p> : null}
      <div>
        Logged in as: <strong>{currentUser.displayName}</strong>
      </div>
    </div>
  )
}