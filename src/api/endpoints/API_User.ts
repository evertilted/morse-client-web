import '../../api-config'
import { security_endpoints, security_root } from '../../api-config'
import { API } from '../APICaller'

const Login = async (credentials: Object) => {
    let url = `${security_root}/${security_endpoints.Login}`
    return API.Post(url, credentials)
}

const Register = async (credentials: Object) => {
    let url = `${security_root}/${security_endpoints.Register}`
    return API.Post(url, credentials)
}

export const API_User = {
    Login: Login,
    Register: Register
}