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

