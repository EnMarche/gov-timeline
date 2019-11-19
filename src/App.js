import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { ConnectedRouter as Router } from 'react-router-redux';
import { connect } from 'react-redux';

import { history } from './js/store';
import './scss/App.css';
import '../node_modules/react-vis/dist/style.css';

import Layout from './js/components/layout';
import SearchPage from './js/components/search-page';
import Dashboard from './js/components/dashboard';
import AuthModal from './js/components/auth-modal';
import AboutModal from './js/components/about-modal';
import { closeAuth, clearToken } from './js/actions/auth-actions';
import { openAbout, closeAbout } from './js/actions/about-actions';
import { closeChezVous } from './js/actions/chez-vous-actions';
import ChezVousFixedModal from './js/components/chezvous-fixed-modal';

class App extends Component {
  render() {
    let {
      hasToken,
      disconnect,
      authModalIsOpen,
      closeAuth,
      aboutModalIsOpen,
      chezVousFixedModalIsOpen,
      openAbout,
      closeAbout,
      closeChezVous,
      useTranslation,
      locale,
    } = this.props;
    return (
      <Router history={history}>
        <Layout
          hasToken={hasToken}
          disconnect={disconnect}
          openAbout={openAbout}
          useTranslation={useTranslation}
        >
          <main className="main">
            <Switch>
              <Route path="/:locale/:profile" component={SearchPage} />
              <Route path="/:locale/results" component={SearchPage} />
              <Route exact path="/:locale" component={Dashboard} />
              <Redirect from="/" to="/fr" />
            </Switch>
          </main>
          <AuthModal isOpen={authModalIsOpen} closeModal={closeAuth} locale={locale} />
          <AboutModal isOpen={aboutModalIsOpen} closeModal={closeAbout} locale={locale} />
          <ChezVousFixedModal isOpen={chezVousFixedModalIsOpen} closeModal={closeChezVous} />
        </Layout>
      </Router>
    );
  }
}

export default connect(state => ({
  authModalIsOpen: state.auth.openModal,
  aboutModalIsOpen: state.aboutModal,
  chezVousFixedModalIsOpen: state.chezVousFixedModal,
  hasToken: state.auth.fetchedToken,
  locale: state.locale,
}), dispatch => ({
  closeAuth: () => dispatch(closeAuth()),
  disconnect: () => dispatch(clearToken()),
  openAbout: () => dispatch(openAbout()),
  closeAbout: () => dispatch(closeAbout()),
  closeChezVous: () => dispatch(closeChezVous()),
}))(App);
