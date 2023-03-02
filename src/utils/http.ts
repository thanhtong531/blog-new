import axios, { AxiosInstance } from 'axios'

class HTTP {
  instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:3001/',
      timeout: 10000
    })
  }
}

const http = new HTTP().instance
export default http
