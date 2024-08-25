import axios from 'axios'

const instance = axios.create({
    baseURL: '/api/v1',
    withCredentials: true
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token === null) return config

    config.headers.Authorization = `Bearer ${token}`
    return config
})

export default instance