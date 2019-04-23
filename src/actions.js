const URL_SERVER = "http://192.168.0.193:5001/collectiveone-dev/us-central1"
// const URL_SERVER = "https://us-central1-collectiveone-dev.cloudfunctions.net"

export const createIniciative = (iniciative,user) => {
    
    if (Object.keys(user).length===0)
        throw('You must provied a valid user and authenticated')

    const i = {
        ...iniciative,
        author: {
            displayName: user.displayName,
            avatarUrl: user.avatarUlr,
            email: user.email,
            userid: user.userid
        }
    }
    return dispatch => {
        fetch(URL_SERVER + '/newIniciative',{method:'POST','content-type': 'application/json',body:JSON.stringify(i)}).
        then(res => res.json().then(data => {
            dispatch({ type: 'NEW_INICIATIVE', iniciative: data })
        }))
    }
}

/*
export const addDocumentToIniciative = (iniciative, documentType, content ) => {

}

export const updateDocument = document => {

}

export const */

export const updateIniciativeFav = iniciative => {
    return dispatch => {
        dispatch({ type: 'UPDATE_INICIATIVE_FAV', iniciative})
    }
}

 export function registerUser(user) {
     return dispatch => {
        fetch(URL_SERVER + '/registerUser',{method:'POST','content-type': 'application/json',body:JSON.stringify(user)}).
            then(res => res.json().then(data => {
                dispatch({type: 'REGISTER_USER',user:data})
            }))
     }
}
