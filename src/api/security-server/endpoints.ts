// configure the server params here
const protocol = 'https'
const server_location = 'localhost'
const server_port = '7188'
const api = 'api'

const api_node = `${protocol}://${server_location}:${server_port}/${api}`
// ============================

const authentication_controller = 'authentication'
export const endpoint_login = `${api_node}/${authentication_controller}/login`
export const endpoint_register = `${api_node}/${authentication_controller}/register`