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