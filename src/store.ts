import { createStore, applyMiddleware, compose } from 'redux'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'; // Add-on you might want
import logger from 'redux-logger'; // Add-on you might want

const composeEnhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const initialState = {
  workpad: {
    // tree: {id -> {}},
    rootId: '',
    tree: {}
  },
  menu: {
    isClose: true
  }
}

export const workpadReducer = (state = { ...initialState.workpad }, action) => {
  switch (action.type) {
    case 'NEW_BLOCK':
      return { ...state, ...action }
    case 'REMOVE BLOCK':
      return { ...state, ...action }
    case 'NEW DRAFT':
      return { ...state, ...action }
    case 'SAVE DRAFT':
      return { ...state, ...action }    
    case 'INIT WORKPAD':
      return { ...state, ...action }
    case 'COMMIT ALL':
      return { ...state, ...action }
    case 'UPDATE CONTENT FROM USER':
        return {...state,...action}
    case 'SET VIEW':
        return {...state,...action}
    case 'NEW PERSPECTIVE':
        return {...state,...action}
    case 'CHANGE PERSPECTIVE':
        return {...state,...action}
    case 'MERGE':
      return {...state,...action}
    default:
      return state
  }
}

export const menuReducer = (state ={...initialState.menu},action) => {
  switch (action.type) {
    case 'OPEN MENU':
      return {...state,...action}
    case 'CLOSE MENU':
        return {...state,...action}
    default:
      return state 
  }
}

const reducers = combineReducers({
  workpad: workpadReducer,
  menu: menuReducer
})





export const configureStore = () =>
  createStore(reducers, composeEnhancer(applyMiddleware(thunk, logger)))



