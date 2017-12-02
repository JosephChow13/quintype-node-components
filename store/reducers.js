import { createStore, combineReducers } from 'redux';
import {
  BREAKING_NEWS_UPDATED,
  CLIENT_SIDE_RENDERED,
  PAGE_LOADING,
  NAVIGATE_TO_PAGE,
  PAGE_FINISHED_LOADING,
  HAMBURGER_CLICKED,
  HAMBURGER_CLOSED
} from './actions';

function breakingNewsReducer(state = [], action) {
  switch (action.type) {
    case BREAKING_NEWS_UPDATED: return action.stories;
    default: return state;
  }
}

function clientSideRenderedReducer(state = false, action) {
  switch (action.type) {
    case CLIENT_SIDE_RENDERED: return true;
    default: return state;
  }
}

function pageLoadingReducer(state = false, action) {
  switch (action.type) {
    case PAGE_LOADING: return true;
    case NAVIGATE_TO_PAGE: return false;
    case PAGE_FINISHED_LOADING: return false;
    default: return state;
  }
}

function hamburgerOpenedReducer(state = false, action) {
  switch(action.type) {
    case HAMBURGER_CLICKED: return true;
    case HAMBURGER_CLOSED: return false;
    case NAVIGATE_TO_PAGE: return false;
    default: return state;
  }
}

export {
  breakingNews: breakingNewsReducer,
  clientSideRendered: clientSideRenderedReducer,
  pageLoading: pageLoadingReducer,
  hamburgerOpened: hamburgerOpenedReducer
};
