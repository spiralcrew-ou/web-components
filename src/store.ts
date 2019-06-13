import { createStore, applyMiddleware, compose } from 'redux'
import { combineReducers } from 'redux'
import thunk from 'redux-thunk'; // Add-on you might want
import logger from 'redux-logger'; // Add-on you might want

const composeEnhancer = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;


const  initialState = {
    workpad: {
        // tree: {id -> {}},
        rootId: ''
    }
}

export const workpadReducer = (state={...initialState.workpad},action) => {
    switch(action.type){
        case 'NEW_BLOCK':
            return {...state,...action}
        case 'DELETE_BLOCK':
            return {...state,...action}
        case 'UPDATE TREE':
            return {...state,...action}
        default:
            return state
    }
}


const reducers = combineReducers({
    workpad: workpadReducer
})





export const configureStore = () =>
    createStore(reducers, composeEnhancer(applyMiddleware(thunk, logger)))



