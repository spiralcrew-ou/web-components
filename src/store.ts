import { createStore, applyMiddleware, compose } from 'redux'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'; // Add-on you might want
import logger from 'redux-logger'; // Add-on you might want

const composeEnhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const initialState = {
  workpad: {
    rootId: '',
    tree: {},
    block: {},
    isRendering: false,
    perspectiveId: null,
    contextPerspectives: []
  },
  menu: {
    isClose: true,
  },
  support: {
    availableProviders: [],
    selectedProvider: []
  }
}

export const workpadReducer = (state = { ...initialState.workpad }, action) => {
  switch (action.type) {
    case 'INIT_TREE':
      return { ...state, ...action }
    case 'RELOAD_TREE':
      return { ...state, ...action }
    case 'SET_CONTENT':
      return { ...state, ...action }
    case 'NEW_BLOCK':
      return { ...state, ...action }
    case 'SET_STYLE':
      return { ...state, ...action }    
    case 'REMOVE_BLOCK':
      return { ...state, ...action }
    case 'COMMIT_GLOBAL':
      return { ...state, ...action }
    case 'NEW_PERSPECTIVE':
      return {...state,...action}
    case 'MERGE':
      return {...state,...action}
    case 'PULL_MADE':
        return {...state,...action}
    case 'RENDERING_WORKPAD':
      return {...state,...action}
    case 'PERSPECTIVE_TO_COMMIT':
      return {...state,...action}
    case 'PERSPECTIVE_TO_CREATE':
      return {...state,...action}
    case 'PERSPECTIVE_TO_CHANGE':
      return {...state,...action}
    case 'PERSPECTIVE_TO_MERGE':
      return {...state,...action}
    case 'UPDATE_CONTEXT_PERSPECTIVES':
      return {...state,...action}
    case 'CHECKOUT_PERSPECTIVE':
      return {...state,...action}
    
    default:
      return state
  }
}

export const menuReducer = (state ={...initialState.menu}, action) => {
  switch (action.type) {
    case 'OPEN_MENU':
      return {...state,...action}
    case 'CLOSE_MENU':
        return {...state,...action}
    default:
      return state 
  }
}

export const supportReducer = (state ={...initialState.support}, action) => {
  switch (action.type) {
    case 'SET_AVAILABLE_PROVIDERS':
      return {...state,...action}
    case 'SET_SELECTED_PROVIDER':
        return {...state,...action}
    default:
      return state 
  }
}


const reducers = combineReducers({
  workpad: workpadReducer,
  menu: menuReducer,
  support: supportReducer
})

export const configureStore = () =>
  createStore(reducers, composeEnhancer(applyMiddleware(thunk, logger)))



