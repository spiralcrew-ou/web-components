import { createStore, applyMiddleware, compose } from 'redux'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'; // Add-on you might want
import logger from 'redux-logger'; // Add-on you might want
import { debug } from 'util';

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const  initialState = {
    loggedUser :null,
    settings : {
        showNotifications: 'ALL'
    },
    notifications: {
        messages: []
    },
    iniciatives: {
        settings: {},
        list:[]
    }
}

export const userReducer = (state = {...initialState.loggedUser}, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, ...action.data }
        case 'REGISTER_USER':
            return {...state,...action.user}
        default:
            return state
    }
}

export const settingsReducer = (state = {...initialState.settings}, action) => {
    switch (action.type) {
        default:
            return state
    }
}

export const notificationsReducer = (state = {...initialState.notifications}, action) => {
    switch (action.type) {
        case 'ALL_NOTIFICATIONS':
            return {...state,messages:action.messages}
        default:
            return state
    }
}

export const iniciativesReducer = (state = {...initialState.iniciatives}, action) => {
    let iniciatives = null 
    switch (action.type) {
        case 'LOAD_INICIATIVES':
            return {
                ...state,
                list: action.iniciatives
            }
        case 'NEW_INICIATIVE':
            iniciatives = state.list
            iniciatives.push(action.iniciative)
            return {...state,list:Object.assign([],iniciatives)}
        case 'UPDATE_INICIATIVE_FAV':
            iniciatives = Object.assign([],state.list)
            let {iniciativeId,fav} = action.iniciative
            let _result = iniciatives.map( i => i.iniciativeId=== iniciativeId ? {...i,fav:!i.fav} : i)
            return {...state,list:_result}
        default: 
            return state
    }
}

const reducers = combineReducers({
    loggedUser: userReducer,
    settings: settingsReducer,
    notifications: notificationsReducer,
    iniciatives: iniciativesReducer
})





export const configureStore = (preloadedState) =>
    createStore(reducers, composeEnhancer(applyMiddleware(thunk, logger)))



