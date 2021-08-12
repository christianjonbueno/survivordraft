import React, { useEffect, useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory, useLocation } from 'react-router-dom';
import firebase from '../firebase.js';

export default function SeasonHome() {
  const location = useLocation();
  const { seasonNum, seasonId } = location.state;
  const { currentUser, logout, updateSeasonStatus, beginSeason } = useAuth();
  const [error, setError] = useState('');
  const [currentDoc, setCurrentDoc] = useState('');
  const [joinedSeason, setJoinedSeason] = useState(false);
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [seasonStarted, setSeasonStarted] = useState(false);
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

  async function handleJoinSeason() {
    await updateSeasonStatus(seasonNum);
    await getUser();
    if (currentDoc.season && currentDoc.season[seasonNum]) {
      setJoinedSeason(true);
    }
  }

  async function getUser() {
    const doc = await db.collection('users').doc(currentUser.uid).get()
    const newData = doc.data();
    setCurrentDoc(newData);
    if (newData.season && newData.season[seasonNum]) {
      setJoinedSeason(true);
    }
    if (newData.admin) {
      let items = [];
      const allDocs = await db.collection('users').where(`season.${seasonNum}`, '==', true).get()
      allDocs.forEach(doc => {
        items.push(doc.data());
      });
      setJoinedUsers(items);
    }
  }

  async function getSeasonStarted() {
    const docs = await db.collection('seasons').where('season','==',seasonNum).get();
    setSeasonStarted(docs.docs[0].data().started);
  }

  async function handleDraftStart(currSeasonId) {
    await beginSeason(currSeasonId);
    history.push('/')
  }

  useEffect(() => {
    getUser();
    getSeasonStarted();
  }, [])

  return (
    <div>
      {!seasonStarted ? (
        <Card>
            <Card.Header><h1 className="text-center">Season {seasonNum}</h1></Card.Header>
            <Card.Body className="text-center">
              {error && <Alert variant="danger">{error}</Alert>}
              {!joinedSeason ? (
                <>
                  <Card.Text className="text-center">Would you like to join this season?</Card.Text>
                  <Button onClick={handleJoinSeason} className="w-50 btn-success" type="submit">Yes</Button>
                </>
              ):(
                (currentDoc && !currentDoc.admin) ? (
                  <Card.Text className="text-center">Waiting for the Season Admin to start the Draft...</Card.Text>
                ):(
                  <>
                    <Card.Text className="text-center">Start the Draft?</Card.Text>
                    <Card.Text className="text-center">There are {joinedUsers.length} players in this Draft.</Card.Text>
                    {joinedUsers.map(user => {
                      return <Card.Text className="text-center" key={user.username}>{user.username}</Card.Text>
                    })}
                  </>
                )
              )}
              <br />
              {(currentDoc && currentDoc.admin) ? (
                <Button variant="success" onClick={() => handleDraftStart(seasonId)}>Begin Draft</Button>
              ):null}
            <Link to="/" className="btn btn-primary w-100 mt-3">Home</Link>
            </Card.Body>
        </Card>
      ):(
        <Card>
          <Card.Header><h1 className="text-center">Season {seasonNum} has begun</h1></Card.Header>
          <Link to="/seasonDraft" className="btn btn-primary w-100 mt-3">Go to Season {seasonNum}</Link>
        </Card>
      )}
        <div className="w-100 text-center mt-2">
          <Button variant="link" onClick={handleLogout}>Log Out</Button>
        </div>
    </div>
  )
}
