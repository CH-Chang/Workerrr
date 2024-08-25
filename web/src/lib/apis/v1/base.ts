import axios from 'axios'
import urlJoin from 'url-join'
import { PUBLIC_BASE_URL } from '$env/static/public'

const instance = axios.create({
    baseURL: urlJoin(PUBLIC_BASE_URL, '/api/v1'),
    withCredentials: true
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token === null) return config

    config.headers.Authorization = `Bearer ${token}`
    return config
})

export default instance