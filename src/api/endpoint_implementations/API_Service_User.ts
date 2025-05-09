import '../api-config'
import { service_endpoints, service_root } from '../api-config'
import { API } from '../APICaller'

const GetFriends = async (userId: string | null) => {
    let url = `${service_root}/${service_endpoints.GetFriends}`
    return API.Get(url, { userId: userId })
}

export const API_Service_User = {
    GetFriends: GetFriends,
}