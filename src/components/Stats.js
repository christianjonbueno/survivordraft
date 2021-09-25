import React, { useEffect, useState } from 'react';
import { Card, Container, Navbar, Table} from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import * as Icon from 'react-bootstrap-icons';
import firebase from '../firebase.js';

export default function Stats() {
  const location = useLocation();
  const { seasonNum, seasonId } = location.state;
  const [allPlayers, setAllPlayers] = useState([]);
  const db = firebase.firestore();

  async function getPlayers() {
    let players = [];
    const allDocs = await db.collection('players').get();
    allDocs.forEach(doc => {
      let obj = doc.data();
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
    let sorted = players.sort((a, b) => {
      if(a.name < b.name) return -1;
      else return 0;
    })
    setAllPlayers(sorted);
  }

  useEffect(() => {
    getPlayers();
  }, [])

  return (
    <div>
      <Card>
          <Card.Header><h1 className="text-center">All Player Stats</h1></Card.Header>
          <Card.Body>
            <Table striped bordered hover style={{marginLeft: "-5px"}}>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Voted Correctly</th>
                  <th>Voted Against</th>
                  <th>Tribals</th>
                </tr>
              </thead>
              <tbody>
              {allPlayers.map(player => {
                return <tr id={player.name} style={{backgroundColor: !player.stats.votedOff ? player.hex : "lightGrey"}}>
                  <td>{player.name}</td>
                  <td>{player.stats.votedCorrectly}</td>
                  <td>{player.stats.votedAgainst}</td>
                  <td>{player.stats.tribals}</td>
                </tr>
              })}
              </tbody>
            </Table>
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
          <Link to="/stats" className="btn btn-outline-secondary w-25 mt-3 mb-4"><Icon.GraphUp /></Link>
        </Navbar>
        </div>
    </div>
  )
}
