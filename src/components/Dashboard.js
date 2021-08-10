import React, { useEffect, useState } from 'react'
import { Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import firebase from '../firebase.js';

export default function Dashboard() {
  const [seasons, setSeasons] = useState([]);
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  
  async function handleLogout() {
    setError('');
    
    try {
      await logout();
      history.push('/login');
    } catch {
      setError('Failed to log out');
    }
  }
  
  useEffect(() => {
    const db = firebase.firestore();
    const getSeasons = async () => {
      const data = await db.collection('seasons').get();
      setSeasons(data.docs.map(doc => doc.data()));
    }
    getSeasons();
    // figure out how to render name + photo after login
  }, [])
  
  return (
    <div>
      <Card>
          <Card.Body>
            <Card.Title>@{currentUser.displayName}</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            {/* {JSON.stringify(currentUser)} */}
            <Card.Img variant="top" src={currentUser.photoURL} alt={`${currentUser.displayName}'s profile pic`}/>
            <br />

            <Link to="/update-profile" className="btn btn-primary w-100 mt-3">Update Profile</Link>
          </Card.Body>
      </Card>
      <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Survivor seasons:</h2>
              {seasons.map(season => {
                return <Link to={{
                  pathname: "/seasonHome",
                  state: {
                    seasonNum: season.season
                  }
                }}
                className="btn btn-success w-100 mt-1"
                key={season.season}
                >
                {season.season}
                </Link>
              })}
          </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>Log Out</Button>
      </div>
    </div>
  )
}
