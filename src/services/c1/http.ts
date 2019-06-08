interface PostResult {
    result: string,
    message: string,
    elementIds: string[];
}

export class Http {

    // baseUrl: string = 'https://uprtcl-dev.herokuapp.com/1';
    baseUrl: string = 'http://localhost:3000/1';
    
    auth: string = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5rUTNPVGt3UXpGR05rSTNRa1EzUTBFNE9UWTNNVEUxTmpnNU9FRkNRVUV6TnpWRk5UazVRUSJ9.eyJuaWNrbmFtZSI6InRvbSIsIm5hbWUiOiJ0b21AeC5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9zLmdyYXZhdGFyLmNvbS9hdmF0YXIvMDgzYTMxYTgwZGNmZGVjNzJkMTBhMDgyYzJiOTUyMDM_cz00ODAmcj1wZyZkPWh0dHBzJTNBJTJGJTJGY2RuLmF1dGgwLmNvbSUyRmF2YXRhcnMlMkZ0by5wbmciLCJ1cGRhdGVkX2F0IjoiMjAxOS0wNi0wNFQxMzoyNDo1OS42MTNaIiwiZW1haWwiOiJ0b21AeC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vY29sbGVjdGl2ZW9uZS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTllZGFjYWI3NDE2OGE3MDM0MTA5OTE4IiwiYXVkIjoia3VEWDFaVm9yQWx5NVBZZHlWNzIxelJvVGYwSzBvcm0iLCJpYXQiOjE1NTk2NTQ2OTksImV4cCI6MTU2MjI0NjY5OX0.UjtU7kwPGrH6cq8fv3mBN6N4aqm5pYoxSTFr77pQ9AEKO8t4wweL466Qg-NDGHG0pjitBJJnC1i29h_7OPDsyRsVZDzSSq2o5TrVaNUUyPFGxNV1A8w8p08cW_UuXMkqhClFwJRkYqaeEORcfxn-SSi1jrIwQSHIu5XKN9NQXZgcFUQ2UqsiI2QD3W7qM-CY6p7X90vnXvwLcuFzzypkzrCEa_Kut10-PQZNEqL-f84C5WlCTs4scatdYzOWB2dKwjPdZ-DQz_LIHAm26IHrzMSF1VFOeuwjkHOhNJl5tcaGJaHqazOO77mbkFWaeh1PkxHTdkDQGFJne5v8j0wsNw';

    async get<T>(url: string): Promise<T> {
        return fetch(this.baseUrl + url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${this.auth}`,
                'Content-Type': 'application/json'
            }
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

    async put(url: string, _body: any) {
        return this.putOrPost(url, _body, "PUT")
    }

    async post(url: string, _body: any) {
        return this.putOrPost(url, _body, "POST")
    }

    async putOrPost(url: string, _body: any, _method: string): Promise<string> {
        return fetch(this.baseUrl + url, {
            method: _method,
            headers: {
                'Authorization': `Bearer ${this.auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },            
            body: JSON.stringify(_body)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            return response.json() as Promise<PostResult>
        })
        .then(result => {
            if (result.elementIds != null) {
                return result.elementIds[0]
            }
        })
}
}

export const http = new Http();

