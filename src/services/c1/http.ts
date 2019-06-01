interface PostResult {
    result: string,
    message: string,
    elementIds: string[];
}

export class Http {

    baseUrl: string = '/1';
    auth: string = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5rUTNPVGt3UXpGR05rSTNRa1EzUTBFNE9UWTNNVEUxTmpnNU9FRkNRVUV6TnpWRk5UazVRUSJ9.eyJuaWNrbmFtZSI6InRvbSIsIm5hbWUiOiJ0b21AeC5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9zLmdyYXZhdGFyLmNvbS9hdmF0YXIvMDgzYTMxYTgwZGNmZGVjNzJkMTBhMDgyYzJiOTUyMDM_cz00ODAmcj1wZyZkPWh0dHBzJTNBJTJGJTJGY2RuLmF1dGgwLmNvbSUyRmF2YXRhcnMlMkZ0by5wbmciLCJ1cGRhdGVkX2F0IjoiMjAxOS0wNS0zMVQxNjoxNjoxOS41NzdaIiwiZW1haWwiOiJ0b21AeC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vY29sbGVjdGl2ZW9uZS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTllZGFjYWI3NDE2OGE3MDM0MTA5OTE4IiwiYXVkIjoia3VEWDFaVm9yQWx5NVBZZHlWNzIxelJvVGYwSzBvcm0iLCJpYXQiOjE1NTkzMTkzNzksImV4cCI6MTU2MTkxMTM3OX0.KGwryPhvvf5UMJD3iU-0xCU3ST1olj_93TxWdGMCC3YVSKNQ1s9PYf9JqUNimldOp-OYJKt2fLHpN-rfqt0NihUjEEDrGebjChsrdSvV3hK9Hz_nQuYVthDSwR8JzQsIBy5X5WeWpN4E2csKb749f_tBFUJlVGUweSaiJeeSV2zCzWSFvvZmW-TFbqGXxODTkkDt6XCL9wl1-af2enXfFJnHh6NbLtg9ojmS4ibZtDTnh4dmAs24F6gSwzvQnR7a7SyBbLmU2-hoJwvHPx0WuC9NjDpdr8-_fMukVhjOEtbuCPCkHDCFGaJk8qVyz4VRDSGS43f2buwIJRJakpx0mA';

    async get<T>(url: string): Promise<T> {
        return fetch(this.baseUrl + url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${this.auth}`
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

