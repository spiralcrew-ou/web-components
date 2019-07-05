interface PostResult {
  result: string;
  message: string;
  elementIds: string[];
}

export class Http {
  // baseUrl: string = 'https://uprtcl-dev.herokuapp.com/1';
  baseUrl: string = 'http://localhost:3000/1';

  auth: string =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik5rUTNPVGt3UXpGR05rSTNRa1EzUTBFNE9UWTNNVEUxTmpnNU9FRkNRVUV6TnpWRk5UazVRUSJ9.eyJuaWNrbmFtZSI6InRvbSIsIm5hbWUiOiJ0b21AeC5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9zLmdyYXZhdGFyLmNvbS9hdmF0YXIvMDgzYTMxYTgwZGNmZGVjNzJkMTBhMDgyYzJiOTUyMDM_cz00ODAmcj1wZyZkPWh0dHBzJTNBJTJGJTJGY2RuLmF1dGgwLmNvbSUyRmF2YXRhcnMlMkZ0by5wbmciLCJ1cGRhdGVkX2F0IjoiMjAxOS0wNy0wNVQwODoyOTowNS42NjNaIiwiZW1haWwiOiJ0b21AeC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vY29sbGVjdGl2ZW9uZS5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NTllZGFjYWI3NDE2OGE3MDM0MTA5OTE4IiwiYXVkIjoia3VEWDFaVm9yQWx5NVBZZHlWNzIxelJvVGYwSzBvcm0iLCJpYXQiOjE1NjIzMTUzNDUsImV4cCI6MTU2NDkwNzM0NX0.QRS2VH562qOiJPCp1vVUSSjTEQ8tHOaqKGA2rQLFfRAVx7tQezz1PBqDTPpq9R5uO6ztF02J6ZfUChTj0JRNTruztNkT369IiecppX4RpMyxtdYk0m7ljVne-XR4geR8pXz8rEyoK4WQhRTdB11KC4RvmjpgIjpGJEHlPsXxv4uunKHONnRRu2LEnSq1aXbLexmDV9vPJxfYCoEMN5xKWxVwnCrU8x-zfyTsjH-89YHFBAD_HqnTdnZ3Ka4xoGpxdtB0mr1gfBUnzsjSqdBgKVzQu3toYI3rK80J7Xb6cj3xtYPM3tM3loXTCColq764i5kYItJm2UgvxeQm2s0ABQ';

  async get<T>(url: string): Promise<T> {
    console.log('[HTTP GET] ', url);
    return fetch(this.baseUrl + url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.auth}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json() as Promise<{ data: T }>;
      })
      .then(data => {
        console.log('[HTTP GET RESULT] ', url, data);
        return data.data;
      });
  }

  async put(url: string, _body: any) {
    return this.putOrPost(url, _body, 'PUT');
  }

  async post(url: string, _body: any) {
    return this.putOrPost(url, _body, 'POST');
  }

  async putOrPost(url: string, _body: any, _method: string): Promise<string> {
    console.log('[HTTP POST] ', url, _body, _method);
    return fetch(this.baseUrl + url, {
      method: _method,
      headers: {
        Authorization: `Bearer ${this.auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(_body)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json() as Promise<PostResult>;
      })
      .then(result => {
        console.log('[HTTP POST RESULT] ', url, _body, _method, result);
        if (result.elementIds != null) {
          return result.elementIds[0];
        }
      });
  }
}

export const http = new Http();
