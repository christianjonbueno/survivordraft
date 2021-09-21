import React, { useEffect, useState } from 'react'
import { Card, Button, CardColumns, Row, Col, Container, Navbar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import firebase from '../firebase.js';
import Chat from './Chat';
import * as Icon from 'react-bootstrap-icons';

export default function SeasonDraft() {
  const location = useLocation();
  const { seasonNum, seasonId, tab } = location.state;
  const { currentUser, getChatHistory, getCurrentChat } = useAuth();
  const [currentDoc, setCurrentDoc] = useState('');
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [switchCurrentTab, setSwitchCurrentTab] = useState('users');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const db = firebase.firestore();

  async function getUser() {
    const doc = await db.collection('users').doc(currentUser.uid).get()
    const newData = doc.data();
    setCurrentDoc(newData);
  }

  async function getAllUsers() {
    let items = [];
    const allDocs = await db.collection('users').where(`season.${seasonNum}`, '==', true).get()
    allDocs.forEach(doc => {
      let obj = doc.data();
      obj.id = doc.id;
      items.push(obj);
    });
    setJoinedUsers(items);
  }

  async function getPlayers() {
    let players = [];
    const allDocs = await db.collection('players').get();
    allDocs.forEach(doc => {
      let obj = doc.data();
      obj.id = doc.id;
      players.push(obj);
    });
    setAllPlayers(players);
  }

  async function getTribes() {
    let tribes = [];
    const allDocs = await db.collection('tribes').get();
    allDocs.forEach(doc => {
      let obj = doc.data();
      obj.id = doc.id;
      tribes.push(obj);
    });
    setTribes(tribes);
  }

  function switchTab(tab) {
    setSwitchCurrentTab(tab);
  }

  async function compareChatHistory() {
    let chatHistory = await getChatHistory();
    let currentChat = await getCurrentChat();
    // console.log("chatHistory ", chatHistory.chatHistory);
    // console.log("currentChat", currentChat);
    setUnreadMessages(currentChat - chatHistory);
  }

  useEffect(() => {
    getUser();
    getAllUsers();
    getPlayers();
    getTribes();
    compareChatHistory();
    switchTab(tab);
  }, [])

  return (
    <div>
      <Card>
          <Card.Header><h1 className="text-center">Season {seasonNum}</h1></Card.Header>
          <Card.Body className="text-center">
            <Row className="text-center bold">
              <Col>
                <Button 
                  size="lg" 
                  variant="outline-secondary"
                  onClick={() => switchTab("users")}
                >
                Users
                </Button>
              </Col>
              <Col>
                <Button 
                  size="lg" 
                  variant="outline-secondary"
                  onClick={() => switchTab("tribes")}
                >
                Tribes
                </Button>
              </Col>
              <Col>
                <Button 
                  size="lg" 
                  variant="outline-secondary"
                  onClick={() => switchTab("chat")}
                >
                Chat
                </Button>
                {unreadMessages ? <p style={{fontSize: "12px", marginBottom: "0px"}}>{unreadMessages} unread</p>: null}
              </Col>
            </Row>
            <hr />
            {switchCurrentTab === "users" ? (
              <Container>
                <Row xs={2} md={2} className="g-3">
                {joinedUsers.map(user => {
                  return <Col key={user.id}>
                    <Link
                      style={{textDecoration: "none", color: "black"}}
                      to={{
                        pathname: "/userPlayers",
                        state: {
                          seasonNum,
                          seasonId,
                          userId: user.id,
                          username: user.username
                        }
                      }}
                    >
                      <Card bg="light">
                        <Card.Body>
                          <Card.Text style={{ fontSize: '15px'}}>{user.username}</Card.Text>
                          <Card.Img variant="top" src={user.photoURL} />
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                })}
                </Row>
              </Container>
            ) : switchCurrentTab === "tribes" ? (
              <CardColumns>
              {tribes.map(tribe => {
                return <Card 
                  key={tribe.tribe_name} 
                  variant="primary"
                  style={{marginBottom: "1rem", backgroundColor: tribe.hex}}
                >
                <Link 
                  to={{
                    pathname: "/players",
                    state: {
                      seasonNum,
                      seasonId,
                      tribe_id: tribe.id,
                      tribe_name: tribe.tribe_name,
                      tribe_color: tribe.color,
                      tribe_hex: tribe.hex
                    }
                  }}
                  className="btn w-100 mt-3"
                  style={{color: "white"}}
                >
                  <Card.Img variant="top" src={tribe.img} />
                  <Card.Body>
                    <Card.Title>{tribe.tribe_name} Tribe</Card.Title>
                        Meet the players of {tribe.tribe_name}
                  </Card.Body>
                  </Link>
                </Card>
              })}
              </CardColumns>
            ) : switchCurrentTab === "chat" ? (
              <Chat></Chat>
            ): null}
          </Card.Body>
      </Card>
        <Navbar className="justify-content-center py-0" fixed="bottom" bg="light" style={{height: "70px", border: "1px solid lightgrey"}}>
          <Link to="/" className="btn btn-outline-secondary w-25 mt-3 mb-4"><Icon.HouseDoorFill /></Link>
        </Navbar>
    </div>
  )
}
