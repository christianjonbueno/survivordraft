import React, { useContext, useState, useEffect } from 'react';
import firebase, { auth, storage } from '../firebase';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  async function signup(email, password, username, image) {
    const storageRef = storage.ref();
    // upload the profile pic to cloud storage
    await storageRef.child(image.name).put(image);
    // create the user
    return auth.createUserWithEmailAndPassword(email, password)
      .then(async (user) => {
        // pull the user’s unique ID out of the result
        const uid = user.user.uid
        // Build a reference to their per-user document in the
        // users collection
        const userDocRef = firebase.firestore().collection('users').doc(uid)
        // Add some initial data to it
        const snapshot = await firebase.firestore().collection('seasons').get();
        const seasonsMap = snapshot.docs.map(doc => doc.data());
        const seasonsList = seasonsMap.map(season => {
          return season.season
        });

        const res = seasonsList.reduce((acc,curr)=> (acc[curr] = false, acc), {});
        console.log(res)
        // grab the url of the recently uploaded image
        storageRef.child(image.name).getDownloadURL()
        .then(async (url) => {
          // update the profile of the newly created user's photoURL to that of the uploaded image
          const docToUpdate = {
            username: username,
            season: res,
            photoURL: url
          }
  
          await userDocRef.set(docToUpdate)
          let currUse = firebase.auth().currentUser;
            currUse.updateProfile({
              displayName: username,
              photoURL: url
            })
          })
      })
      .catch(error => {
        console.error(error);
      })
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  async function updatePhoto(image) {
    const storageRef = storage.ref();
    await storageRef.child(image.name).put(image);

    storageRef.child(image.name).getDownloadURL()
    .then(async (url) => {
      let currUse = firebase.auth().currentUser;
      currUse.updateProfile({
        photoURL: url
      })
      firebase.firestore()
        .collection('users')
        .doc(currUse.uid)
        .update({
          photoURL: url
        })
      })
  }

  async function updateUsername(username) {
    let currUse = firebase.auth().currentUser;
    currUse.updateProfile({
      displayName: username
    })
    firebase.firestore()
      .collection('users')
      .doc(currUse.uid)
      .update({
        username: username
      })
  }

  function updateSeasonStatus(seasonNum) {
    let currUse = firebase.auth().currentUser;
    firebase.firestore()
      .collection('users')
      .doc(currUse.uid)
      .update({
        [`season.${seasonNum}`]: true
      });
  }

  async function beginSeason(seasonId) {
    const seasonDocRef = await firebase.firestore().collection('seasons').doc(seasonId);
    await seasonDocRef.update({started: true});
  }

  async function getCurrentChat() {
    let chats = [];

    await firebase.database().ref('chats').on('value', snapshot => {
      snapshot.forEach(snap => {
        chats.push(snap.val());
      });
    })
    return chats;
  }

  async function getChatHistory() {
    const doc = await firebase.firestore().collection('users').doc(currentUser.uid).get()
    const user = doc.data();
    return user;
  }

  async function saveChatHistory(chats) {
    let currUse = firebase.auth().currentUser;
    firebase.firestore()
      .collection('users')
      .doc(currUse.uid)
      .update({
        chatHistory: chats
      });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    })

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    updateSeasonStatus,
    beginSeason,
    updatePhoto,
    updateUsername,
    getChatHistory,
    saveChatHistory,
    getCurrentChat
  }
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
