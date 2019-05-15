import {generateCID} from './main_functions'

const ctx1 = {
    "root": {
        "id": "2c00f",
        "contextId": "ctx1",
        "view": "initiative",
        "name": "default",
        "head": "ab500"
    },
    "commits": {
        "ab500": {
            "id": "ab500",
            "content": {
                "data": "8253a",
                "links": {
                    "a231c": {
                        "id": "a231c",
                        "order": {},
                        "type": "perspective"
                    },
                    "ddeb0": {
                        "id": "ddeb0",
                        "order": {},
                        "type": "perspective"
                    },
                }
            }
        }
    },
    "data": {
        "8253a": {
            "text": "Initiative 1",
            "description": "Initiative 1 is about saving the amazon forest"
        }
    }
}


const data = {
    x89024:  {
        root: {
            id: "20045f",
            contextId: 'x89024',
            view: '',
            name: 'default',
            head: 'ab670'
        },
        commits: {
            ab670: {
                id: 'ab670',
                type: 'co-title1',
                content: {
                    data: 'b6753'
                }
            }
        },
        data: {
            b6753: {
                content: 'Forestación amazonas'
            }
        }
    },
    d99083cd:  {
        root: {
            id: "4352",
            contextId: 'd99083cd',
            view: '',
            name: 'default',
            head: 'x0092'
        },
        commits: {
            x0092: {
                id: 'x0092',
                type: 'co-paragraph',
                content: {
                    data: 'cf9909'
                }
            }
        },
        data: {
            cf9909: {
                content: `
                Imagen de satélite mostrando la deforestación en una región del Mato Grosso, el estado brasileño que sufre las pérdidas recientes más graves.
                La deforestación en Brasil es uno de los grandes problemas ecológicos que el país enfrenta en la actualidad. Según el científico Ronaldo Hernández, la deforestación resulta en problemas ambientales en todo el mundo. No solo afecta a las personas en ese lugar, si no, a todo el mundo. Varias son sus causas, y  tienen peso distinto en las diversas regiones, siendo las más importantes la conversión de las tierras para la agricultura o para la ganadería, la explotación maderera, la usurpación de tierras, la urbanización y la creación de infraestructuras como puentes, carreteras y embalses.1​2​El estado del Mato Grosso es el más afectado por la deforestación, seguido por el de Pará y Rondônia.3`
            }
        }
    }
}







const iniciative = {
    id: '63-03232-9230x',
    name: 'Proyecto para la reforestación del amazonas',
    summary: `Proyecto mundial para la conservación y reforestación de la selva amazonica`,
    date: '',
    author: {
        id: 'google:19012r13413423',
        provider: 'auth0',
        displayName: 'Leonardo Gabriel Leenen',
        email: 'leonardo@flicktrip.com'
    },
    colaborators: [],
    contexts: [{
            contextId: 'x89024',
            revision: 'ab670'
        },
        {
            contextId: 'd99083cd',
            revision: 'x0092'
        }
    ]
}


const URL_SERVER = "http://192.168.0.193:5001/collectiveone-dev/us-central1"
// const URL_SERVER = "https://us-central1-collectiveone-dev.cloudfunctions.net"

export const createIniciative = (iniciative, user) => {

    if (Object.keys(user).length === 0)
        throw ('You must provied a valid user and authenticated')

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
        fetch(URL_SERVER + '/newIniciative', { method: 'POST', 'content-type': 'application/json', body: JSON.stringify(i) }).
            then(res => res.json().then(data => {
                dispatch({ type: 'NEW_INICIATIVE', iniciative: data })
            }))
    }
}

export const fetchIniciative = ()  => {
    iniciative.documents = []
    iniciative.contexts.forEach(c => {
        iniciative.documents.push({
            id: c.contextId + "-" + c.revision,
            type: data[c.contextId].commits[data[c.contextId].root.head].type,
            content: data[c.contextId].data[data[c.contextId].commits[data[c.contextId].root.head].content.data].content
        })
    })

    return iniciative
}



/*
export const createContext = (userId,contextType) => {
    return dispatch => {
        dispatch({type: 'EDITING_CONTEXT',payload:{contextType}})
    }
}*/

export const callNewPerspective = currentContext =>  {
    const callData = {
        callId: 'NEW_PERSPECTIVE',
        payLoad: currentContext
    }
    return dispatch => {
        dispatch({ type: 'NEW_PERSPECTIVE', callData })
    }
}

export const updateIniciativeFav = iniciative => {
    return dispatch => {
        dispatch({ type: 'UPDATE_INICIATIVE_FAV', iniciative })
    }
}

export function registerUser(user) {
    return dispatch => {
        fetch(URL_SERVER + '/registerUser', { method: 'POST', 'content-type': 'application/json', body: JSON.stringify(user) }).
            then(res => res.json().then(data => {
                dispatch({ type: 'REGISTER_USER', user: data })
            }))
    }
}
