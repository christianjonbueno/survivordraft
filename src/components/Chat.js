import React, { useEffect, useState, useRef } from 'react'
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import firebase from '../firebase.js';
import TimeAgo from 'react-timeago';
import FadeIn from 'react-fade-in';
import * as Icon from 'react-bootstrap-icons';

export default function Chat({seasonNum}) {
  const { currentUser, saveChatHistory } = useAuth();
  const contentRef = useRef();
  const chatsRef = useRef();
  const [inputText, setInputText] = useState('');
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [joinedUsernames, setJoinedUsernames] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHovered, setSearchHovered] = useState(false);
  const [mentioned, setMentioned] = useState({});
  const [writeError, setWriteError] = useState(null);
  const db = firebase.firestore();

  const chatStyle = {
    paddingLeft: '10px',
    height: '500px',
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

  let searchResultStyle = searchHovered ? {
    width: "75%",
    height: "100%",
    marginLeft: "4%",
    marginBottom: "1rem",
    position: "float",
    textAlign: "left",
    cursor: 'pointer'
  } : {
    width: "75%",
    height: "100%",
    marginLeft: "4%",
    marginBottom: "1rem",
    position: "float",
    textAlign: "left"
  }

  function changeStyling() {
    setSearchHovered(true);
  }

  async function getAllUsers() {
    let users = [];
    let usernames = [];

    const allDocs = await db.collection('users').where(`season.${seasonNum}`, '==', true).get()
    allDocs.forEach(doc => {
      let obj = doc.data();
      obj.id = doc.id;
      users.push(obj);
      usernames.push(obj.username);
    });
    setJoinedUsers(users);
    setJoinedUsernames(usernames);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if(Object.keys(mentioned).length > 0) {
        // do code to update user's profile to add to mention array
      }

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

  function renderChats() {
    firebase.database().ref('chats').on('value', snapshot => {
      let chats = [];
      snapshot.forEach(snap => {
        chats.push(snap.val());
      });
      setChats(chats);
    })

    if (!chatsRef.current) {
      chatsRef.current = document.getElementsByClassName('chats');
    }
    chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
  }

  function changeHandler(e) {
    let typedText = e.target.value;
    let currentSearch = [];

    if(typedText.includes('@')) {
      console.log('new search:')
      for(let user of joinedUsers) {
        if(user.username.includes(typedText.slice(typedText.indexOf('@') + 1))) {
          currentSearch.push(user);
          console.log(user)
        }
      }
    }
    setSearchResults(currentSearch);
    setInputText(typedText);
  }

  function chooseName(user) {
    let inp = document.getElementById('message');
    let currentInputText = inputText;

    inp.value = currentInputText.slice(0, currentInputText.indexOf('@')) + '@' + user.username;
    setInputText(inp.value);
    setMentioned(user);
    setSearchResults('');
  }

  useEffect(() => {
    getAllUsers();
    setTimeout(() => {
      renderChats();
    }, 1000);
  }, [])

  return (
    <div>
      <div className="chats" style={chatStyle} ref={chatsRef}>
        {chats.length < 1 ? (
          <FadeIn className="justify-content-center row" style={{height: "100%"}}>
            <Icon.ChatDots className="col-12" style={{height: "2em", verticalAlign: "middle", marginTop: "50%"}} />
          </FadeIn>
        ): null}
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
            style={inputStyle}
            onChange={(e) => changeHandler(e)}
          />
          <Button variant="success" type="submit" id="button">Send</Button>
        </Form.Group>
      </Form>
      {writeError ? <p>{writeError}</p> : null}
      <div className="searchResults">
        {searchResults.length > 0 ? (
          searchResults.map((result) => {
            return <div style={searchResultStyle} onMouseOver={() => changeStyling()}>
              <strong onClick={() => chooseName(result)}>@{result.username}</strong>
              </div>
          })
        ):null}
      </div>
      <div>
        Logged in as: <strong>{currentUser.displayName}</strong>
      </div>
    </div>
  )
}