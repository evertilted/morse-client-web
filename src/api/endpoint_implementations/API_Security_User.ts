import '../api-config'
import { security_endpoints, security_root } from '../api-config'
import { API } from '../APICaller'

const Login = async (credentials: Object) => {
    let url = `${security_root}/${security_endpoints.Login}`
    return API.Post(url, credentials)
}

const Register = async (credentials: Object) => {
    let url = `${security_root}/${security_endpoints.Register}`
    return API.Post(url, credentials)
}

const ValidateJWT = async () => {
    let url = `${security_root}/${security_endpoints.ValidateJWT}`
    return API.Post(url)
}

export const API_Security_User = {
    Login: Login,
    Register: Register,
    ValidateJWT: ValidateJWT
}