import { WebAuth } from 'auth0-js';

const auth0Options = {
    domain: 'collectiveone.auth0.com',
    clientID: 'kuDX1ZVorAly5PYdyV721zRoTf0K0orm'
}

let auth = new WebAuth(auth0Options);

const loginOptions = {
    email: 'tom@x.com',
    password: '123456',
    responseType: 'id_token',
    redirectUri: 'http://localhost:3333'
}

auth.login(loginOptions, (error, result) => {
    console.log(error);
    console.log(result);
});


export class Http {
    async get<T>(url: string): Promise<T> {
        return fetch(url, {
            method: "GET"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<{ data: T }>
            })
            .then(data => {
                return data.data
            })
    }

    async put<T>(url: string, _body: any) {
        return this.putOrPost<T>(url, _body, "PUT")
    }

    async post<T>(url: string, _body: any) {
        return this.putOrPost<T>(url, _body, "POST")
    }

    async putOrPost<T>(url: string, _body: any, _method: string): Promise<T> {
        return fetch(url, {
            method: _method,
            body: JSON.stringify(_body)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<{ data: T }>
            })
            .then(data => {
                return data.data
            })
    }
}

export const http = new Http();

