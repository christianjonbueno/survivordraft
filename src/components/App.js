import React from 'react';
import Signup from './Signup';
import { Container } from 'react-bootstrap';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import PrivateRoute from './PrivateRoute';
import ForgotPassword from './ForgotPassword';
import UpdateProfile from './UpdateProfile';
import SeasonHome from './SeasonHome';
import SeasonDraft from './SeasonDraft';
import Players from './Players';
import UserPlayers from './UserPlayers';
import Chat from './Chat';
import Stats from './Stats';

function App() {
  return (
    <Container 
    className="d-flex align-items-center justify-content-center"
    style={{ minHeight: "100vh "}}
    >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Router>
            <AuthProvider>
              <Switch>
                <PrivateRoute exact path="/" component={Dashboard} />
                <PrivateRoute path="/update-profile" component={UpdateProfile} />
                <PrivateRoute path="/seasonHome" component={SeasonHome} />
                <PrivateRoute path="/seasonDraft" component={SeasonDraft} />
                <PrivateRoute path="/players" component={Players} />
                <PrivateRoute path="/chat" component={Chat} />
                <PrivateRoute path="/userPlayers" component={UserPlayers} />
                <PrivateRoute path="/stats" component={Stats} />
                <Route path="/signup" component={Signup} />
                <Route path="/login" component={Login} />
                <Route path="/forgot-password" component={ForgotPassword} />
              </Switch>
            </AuthProvider>
          </Router>
        </div>
      </Container>
  )
}

export default App;
