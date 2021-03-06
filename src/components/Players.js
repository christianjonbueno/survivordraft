import React, { useEffect, useState } from 'react'
import FadeIn from 'react-fade-in';
import { Card, Button, Row, Col, Container, ListGroup, ListGroupItem, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import * as Icon from 'react-bootstrap-icons';
import firebase from '../firebase.js';

export default function Players() {
  const location = useLocation();
  const { seasonNum, seasonId, tribe_id, tribe_name, tribe_hex } = location.state;
  const [allPlayers, setAllPlayers] = useState([]);
  const [clickedPlayer, setClickedPlayer] = useState('');
  const [showPlayerStatus, setShowPlayerStatus] = useState(false);
  const db = firebase.firestore();

  async function getPlayers() {
    let players = [];
    const allDocs = await db.collection('players').get();
    allDocs.forEach(doc => {
      let obj = doc.data();
      if (obj.tribeId === tribe_id) {
        obj.id = doc.id;
        players.push(obj);
      }
    });
    setAllPlayers(players);
  }

  function showPlayer(player) {
    setClickedPlayer(player);
  }

  function showPopup() {
    setShowPlayerStatus(!showPlayerStatus);
  }

  useEffect(() => {
    getPlayers();
  }, [])

  return (
    <div>
      <Card>
          <Card.Header><h1 className="text-center">{tribe_name}</h1></Card.Header>
          <Card.Body style={{backgroundColor: tribe_hex}}>
            <Container>
            {!showPlayerStatus ? (
            <Row xs={2} md={2} className="g-4">
            {allPlayers.map(player => {
              return <Col key={player.id}>
                <Card bg="light" onClick={() => {
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
                <Card bg="light">
                  <Card.Body className="text">
                    <Card.Img variant="top" src={clickedPlayer.img} />
                    <Card.Title>{clickedPlayer.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{clickedPlayer.occupation}</Card.Subtitle>
                    <ListGroup className="list-group-flush">
                      <ListGroupItem>Age: {clickedPlayer.age}</ListGroupItem>
                      <ListGroupItem>Hometown: {clickedPlayer.location}</ListGroupItem>
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
                tab: 'tribes'
              }
            }}
            className="btn btn-outline-secondary w-25 mt-3 mb-4"
            style={{verticalAlign: "top"}}
          >
            <Icon.ArrowLeftSquareFill />
          </Link>
          <Link to="/" className="btn btn-outline-secondary w-25 mt-3 mb-4"><Icon.HouseDoorFill /></Link>
          <Link
            to={{
              pathname: "/stats",
              state: {
                seasonNum,
                seasonId
              }
            }}
            className="btn btn-outline-secondary w-25 mt-3 mb-4"
          >
            <Icon.GraphUp />
          </Link>
        </Navbar>
        </div>
    </div>
  )
}
