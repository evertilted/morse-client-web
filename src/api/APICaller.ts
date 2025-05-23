import axios, { AxiosResponse, AxiosError } from 'axios'

const config = {
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
     }
}

const Get = async (url: string, data?: object) => {
    try {
        // TODO append data to the request if exists
        const response: AxiosResponse = await axios.get(url, config)
        return response.data
    }
    catch (error) {
        throw error as AxiosError
    }
}

const Post = async (url: string, data?: object) => {
    try {
        const response: AxiosResponse = await axios.post(url, data, config)
        return response.data
    }
    catch (error) {
        throw error as AxiosError
    }
}

export const API = {
    Get: Get,
    Post: Post
}