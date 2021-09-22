import React, { useRef, useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';

export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const photoURLRef = useRef();
  const usernameRef = useRef();
  const { currentUser, updateEmail, updatePassword, updatePhoto, updateUsername } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  
  function handleSubmit(event) {
    event.preventDefault();
    let image;
    let username;

    if (photoURLRef.current.value) {
      image = photoURLRef.current.files[0];
    }

    if (usernameRef.current.value) {
      username = usernameRef.current.value;
    }

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    let promises = [];
    setLoading(true);
    setError('');
    
    if ((emailRef.current.value) && (emailRef.current.value !== currentUser.email)) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value));
    }

    if (image) {
      promises.push(updatePhoto(image));
    }

    if (username) {
      promises.push(updateUsername(username));
    }

    Promise.all(promises)
      .then(() => {
        history.push('/');
      })
      .catch((error) => {
        console.log(error)
        setError('Failed to update account');
      })
      .finally(() => {
        setLoading(false);
      })

  }

  return (
    <div>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error.message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="photoURL">
              <Form.Label>Profile Pic</Form.Label>
              <Form.File ref={photoURLRef} />
            </Form.Group>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} placeholder={currentUser.email} />
            </Form.Group>
            <Form.Group id="username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" ref={usernameRef} placeholder={`@${currentUser.displayName}`} />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" ref={passwordRef} placeholder="Leave blank to keep the same" />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type="password" ref={passwordConfirmRef} placeholder="Leave blank to keep the same" />
            </Form.Group>
            <Button disabled={loading} className="w-100" type="submit">Update</Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
    </div>
  )
}


// https://firebasestorage.googleapis.com/v0/b/survivor-dev-5be77.appspot.com/o/IMG_6004%20(1).jpg?alt=media&token=3628d24a-c530-4ed8-a4c6-5ec48ee699c0