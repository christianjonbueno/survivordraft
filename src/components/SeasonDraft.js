import React, { useEffect, useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory, useLocation } from 'react-router-dom';
import firebase from '../firebase.js';

export default function SeasonDraft() {
  const location = useLocation();
  const { seasonNum, seasonId } = location.state;
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const [currentDoc, setCurrentDoc] = useState('');
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  console.log(allPlayers)
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
    const allDocs = await db.collection('players').get()
    allDocs.forEach(doc => {
      let obj = doc.data();
      obj.id = doc.id;
      players.push(obj);
    });
    setAllPlayers(players);
  }
 
  useEffect(() => {
    getUser();
    getAllUsers();
    getPlayers();
  }, [])

  return (
    <div>
      <Card>
          <Card.Header><h1 className="text-center">Season {seasonNum}</h1></Card.Header>
          <Card.Body className="text-center">
            {error && <Alert variant="danger">{error}</Alert>}
              <Card.Text className="text-center">Test</Card.Text>
            <br />
          <Link to="/" className="btn btn-primary w-100 mt-3">Home</Link>
          </Card.Body>
      </Card>
        <div className="w-100 text-center mt-2">
          <Button variant="link" onClick={handleLogout}>Log Out</Button>
        </div>
    </div>
  )
}
