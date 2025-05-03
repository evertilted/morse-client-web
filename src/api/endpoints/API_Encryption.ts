import '../../api-config'
import { security_endpoints, security_root } from '../../api-config'
import { API } from '../APICaller'

const ClientEncryptionKey = async () => {
    let url = `${security_root}/${security_endpoints.ClientEncryptionKey}`
    return API.Get(url)
}


export const API_Encryption = {
    ClientEncryptionKey: ClientEncryptionKey
}