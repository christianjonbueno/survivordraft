import React, { useEffect, useState } from 'react'
import FadeIn from 'react-fade-in';
import { Card, Button, CardColumns, Row, Col, Container, ListGroup, ListGroupItem } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory, useLocation } from 'react-router-dom';
import firebase from '../firebase.js';

export default function UserPlayers() {
  const location = useLocation();
  const { seasonNum, seasonId, tribe_name, tribe_color, tribe_hex, userId, username } = location.state;
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const [currentDoc, setCurrentDoc] = useState('');
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [tribes, setTribes] = useState([]);
  const [currentTribe, setCurrentTribe] = useState('');
  const [clickedPlayer, setClickedPlayer] = useState('');
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);
  const history = useHistory();
  const db = firebase.firestore();

  async function handleLogout() {
    setError('');

    try {
      await logout();
      history.push('/login');
    } catch {
      setError('Failed to log out');
    }
  }

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
    const allDocs = await db.collection('players').where('userId', '==', userId).get();

    allDocs.forEach(async (play) => {
      let obj = play.data();
      if (play.tribeId === "1GHFRFEIZOCSX3jicfqp") {
        obj.hex= "#5197A8"
      }
      players.push(obj);
    });
    setAllPlayers(players);
  }
console.log(allPlayers)
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

  function showPlayer(player) {
    setClickedPlayer(player);
  }

  function showPopup() {
    setShowPlayerStatus(!showPlayerStatus);
  }

  useEffect(() => {
    getUser();
    getAllUsers();
    getTribes();
    getPlayers();
  }, [])

  return (
    <div>
      <Card>
          <Card.Header><h1 className="text-center">{username}</h1></Card.Header>
          <Card.Body style={{backgroundColor: tribe_hex}}>
            <Container>
            {!showPlayerStatus ? (
            <Row xs={2} md={2} className="g-4">
            {allPlayers.map(player => {
              return <Col key={player.id}>
                <Card 
                  // style={{backgroundColor: player.tribe.hex}}
                  onClick={() => {
                    showPlayer(player)
                    showPopup()
                  }}>
                  <Card.Body>
                    <Card.Text style={{ fontSize: '12px'}}>{player.name}</Card.Text>
                    <Card.Img variant="top" src={player.img} />
                  </Card.Body>
                </Card>
              </Col>
            })}
              </Row>
              ):(
              <FadeIn>
                <Card bg="light">
                  <Card.Body className="text">
                    <Card.Img variant="top" src={clickedPlayer.img} />
                    <Card.Title>{clickedPlayer.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{clickedPlayer.occupation}</Card.Subtitle>
                    <ListGroup className="list-group-flush">
                      <ListGroupItem>Age: {clickedPlayer.age}</ListGroupItem>
                      <ListGroupItem>Hometown: {clickedPlayer.location}</ListGroupItem>
                      {/* <ListGroupItem style={{backgroundColor: clickedPlayer.tribe.hex}}>Tribe: {clickedPlayer.tribe.tribe_name}</ListGroupItem> */}
                      <ListGroupItem>Idols: {clickedPlayer.idols}</ListGroupItem>
                    </ListGroup>
                  </Card.Body>
                  <Card.Footer className="text-center">
                    <Button variant="secondary" onClick={() => showPopup()}>Close</Button>
                  </Card.Footer>
                </Card>
              </FadeIn>
              )}
            </Container>
          </Card.Body>
      </Card>
        <div className="w-100 text-center mt-2">
          <Link to="/" className="btn btn-primary w-100 mt-3">Home</Link>
          <Button variant="link" onClick={handleLogout}>Log Out</Button>
        </div>
    </div>
  )
}
