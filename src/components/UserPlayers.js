import React, { useEffect, useState } from 'react'
import FadeIn from 'react-fade-in';
import { Card, Button, CardColumns, Row, Col, Container, ListGroup, ListGroupItem, Navbar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory, useLocation } from 'react-router-dom';
import * as Icon from 'react-bootstrap-icons';
import firebase from '../firebase.js';

export default function UserPlayers() {
  const location = useLocation();
  const { seasonNum, seasonId, userId, username } = location.state;
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
      if (obj.tribeId === "1GHFRFEIZOCSX3jicfqp") {
        obj.tribe_name = "Luvu";
        obj.hex = "#5197A8";
      }
      if (obj.tribeId === "On6FyTemeNTakwZlzYCw") {
        obj.tribe_name = "Yase";
        obj.hex = "#E1CC78";
      }
      if (obj.tribeId === "mrSd3IfaxHM7ZwNsh2zU") {
        obj.tribe_name = "Ua";
        obj.hex = "#85AF67";
      }
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
        <Card.Body>
          <Container>
          {!showPlayerStatus ? (
          <Row xs={2} md={2} className="g-4">
          {allPlayers.map(player => {
            return <Col key={player.id}>
              <Card 
                style={{backgroundColor: player.hex}}
                onClick={() => {
                  showPlayer(player)
                  showPopup()
                }}>
                <Card.Body>
                  <Card.Text style={{ fontSize: '13px'}}>{player.name}</Card.Text>
                  <Card.Img variant="top" src={player.img} />
                </Card.Body>
              </Card>
            </Col>
          })}
            </Row>
            ):(
            <FadeIn>
              <Card>
                <Card.Body className="text">
                  <Card.Img variant="top" src={clickedPlayer.img} />
                  <Card.Title>{clickedPlayer.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{clickedPlayer.occupation}</Card.Subtitle>
                  <ListGroup className="list-group-flush">
                    <ListGroupItem>Age: {clickedPlayer.age}</ListGroupItem>
                    <ListGroupItem>Hometown: {clickedPlayer.location}</ListGroupItem>
                    <ListGroupItem style={{backgroundColor: clickedPlayer.hex}}>Tribe: {clickedPlayer.tribe_name}</ListGroupItem>
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
        <Navbar className="justify-content-center py-0" fixed="bottom" bg="light" style={{height: "70px", border: "1px solid lightgrey"}}>
          <Link 
            to={{
              pathname: "/seasonDraft",
              state: {
                seasonNum,
                seasonId,
                tab: 'users'
              }
            }}
            className="btn btn-outline-secondary w-25 mt-3 mb-4"
            style={{verticalAlign: "top"}}
          >
            <Icon.ArrowLeftSquareFill />
          </Link>
          <Link to="/" className="btn btn-outline-secondary w-25 mt-3 mb-4"><Icon.HouseDoorFill /></Link>
        </Navbar>
      </div>
    </div>
  )
}
