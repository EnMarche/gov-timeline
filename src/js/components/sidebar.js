import React, { Component } from 'react';
import { SearchBox } from 'react-instantsearch/dom';

import Media from "react-media"
import Color from 'color';

import ToggleSwitch from './toggle-switch';
import LastUpdated from './last-updated';
import { ThemesList, ThemesDropdown } from './themes';
import { Profiles, ProfilesDropdown } from './profiles';
import {
  toggleMajor,
  doQuery,
  toggleProfile,
  toggleTheme,
  resetParams,
  QUERY,
  THEME,
  PROFILE
} from '../actions/search-actions';

import '../../scss/sidebar.css';
import '../../scss/filter-button.css';
import 'react-select/dist/react-select.css';

const BUTTON_COLORS = [
  {
    // yellow
    bg: Color('#6f81ff'),
    color: Color('#fff'),
  },
  {
    // teal
    bg: Color('#6f81ff'),
    color: Color('#fff'),
  },
  {
    // purple
    bg: Color('#6f81ff'),
    color: Color('#fff'),
  },
  {
    // red
    bg: Color('#6f81ff'),
    color: Color('#fff'),
  },
  // {
  //   // dark gray
  //   bg: Color('#b6b6b6'),
  //   color: Color('#444444'),
  // },
];

export const getColor = i => {
  let index = i % BUTTON_COLORS.length;
  let { bg, color } = BUTTON_COLORS[index];
  return {
    backgroundColor: bg.rgb().alpha(.7).string(),
    color: color.rgb().string(),
  };
};

export const FilterButton = ({isActive, label, onClick, style, buttonRef, children}) =>
  <button
   className={`filter-button ${isActive && 'is-active'}`}
   onClick={onClick}
   style={style}
   ref={buttonRef}>
    <span>{children || label}</span>
  </button>

const MobileSidebar = ({ location, match, resetParams, toggleMajor }) =>
  <div className="sidebar-group">
    <h3 className="sidebar-title">
      <ToggleSwitch onChange={e => toggleMajor(e.target.checked)}>
        Voir les principaux engagements :
      </ToggleSwitch>
    </h3>

    <ThemesDropdown attributeName="title" location={location} match={match} />
    <button className="sidebar-reset visibility-hidden" onClick={() => resetParams(location, match, THEME)}>Réinitialiser</button>

    <ProfilesDropdown attributeName="profileIds" location={location} match={match} />
    <button className="sidebar-reset visibility-hidden" onClick={() => resetParams(location, match, PROFILE)}>reset profile</button>

    <button className="sidebar-reset sidebar-reset--mobile" onClick={() => resetParams(location, match)}>Réinitialiser les filtres</button>
  </div>


const DesktopSidebar = ({ resetParams, location, match, toggleProfile, toggleTheme, showMore, profiles, themes, doQuery, toggleMajor }) =>
  <div className="sidebar-group">
    <h3 className="sidebar-title">
      <ToggleSwitch onChange={e => toggleMajor(e.target.checked)}>
        Voir les principaux engagements :
      </ToggleSwitch>
    </h3>
    <h3 className="sidebar-title">
      Filtrer par thème
    </h3>
    <button className="sidebar-reset visibility-hidden" onClick={() => resetParams(location, match, THEME)}>Réinitialiser</button>

    <ThemesList
      themes={themes}
      location={location}
      match={match}
      toggleTheme={toggleTheme}
      onViewMore={showMore} />


    <Profiles
      location={location}
      locale={match.params.locale}
      toggleProfile={toggleProfile}
      profiles={profiles}
      limitMin={1000}
      attributeName="profileIds">

      <h3 className="sidebar-title">
        Je suis...
      </h3>
      <button className="sidebar-reset visibility-hidden" onClick={() => resetParams(location, match, PROFILE)}>Réinitialiser</button>

    </Profiles>

    <div className="sidebar-search">
      <SearchBox
        onInput={e => doQuery(e.target.value)}
        searchAsYouType={false}
        translations={{placeholder: 'Filtrer par mot-clé'}}/>
      <button className="sidebar-reset visibility-hidden" onClick={() => resetParams(location, match, QUERY)}>Réinitialiser</button>
      <button className="sidebar-reset" onClick={() => resetParams(location, match)}>Réinitialiser les filtres</button>
    </div>

    <div className="sidebar-footer">
      <LastUpdated />
    </div>

  </div>

export default class Sidebar extends Component {
  state = {}

  seeMoreRefinements() {
    this.setState({ viewingMore: true });
  }

  render() {
    let { viewingMore } = this.state;
    let { location, match, profiles, themes, dispatch } = this.props;
    return (
      <aside className={`sidebar${viewingMore ? ' sidebar-more' : ''}`}>

        <Media query="(min-width: 800px)">
        {matches =>
          matches ?
            <DesktopSidebar
             location={location}
             match={match}
             profiles={profiles}
             themes={themes}
             showMore={this.seeMoreRefinements.bind(this)}
             toggleTheme={(...args) => dispatch(toggleTheme(...args))}
             toggleProfile={(...args) => dispatch(toggleProfile(...args))}
             doQuery={(...args) => dispatch(doQuery(...args))}
             resetParams={(...args) => dispatch(resetParams(...args))}
             toggleMajor={checked => dispatch(toggleMajor(checked))}
            />
          :
            <MobileSidebar
             location={location}
             match={match}
             resetParams={(...args) => dispatch(resetParams(...args))}
             toggleMajor={checked => dispatch(toggleMajor(checked))}
            />
        }
        </Media>

      </aside>
    );
  }
}
