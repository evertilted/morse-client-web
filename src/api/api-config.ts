// SECURITY SERVER CONFIGURATION
const security_server = {
    protocol: 'https',
    ip: 'localhost',
    port: '7188',
    api_root: 'api'
}

export const security_root: string = `${security_server.protocol}://${security_server.ip}:${security_server.port}/${security_server.api_root}`

const security_controllers = {
    Authentication: 'Authentication',
}

export const security_endpoints = {
    Login: `${security_controllers.Authentication}/Login`,
    Register: `${security_controllers.Authentication}/Register`,
    ValidateJWT: `${security_controllers.Authentication}/ValidateJWT`
}
// END SECURITY SERVER CONFIGURATION

// SERVICE SERVER CONFIGURATION
const service_server = {
    protocol: 'https',
    ip: 'localhost',
    port: '7189',
    api_root: 'api'
}

export const service_root: string = `${service_server.protocol}://${service_server.ip}:${service_server.port}/${service_server.api_root}`

export const service_hubs = {
    Call: `${service_root}/Call`
}

const service_controllers = {
    User: 'User',
}

export const service_endpoints = {
    GetFriends: `${service_controllers.User}/Friends`
}
// END SERVICE SERVER CONFIGURATION