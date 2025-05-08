The localhost certificate is created with https://github.com/FiloSottile/mkcert

1. CD to the 'cert' directory (where this readme is located)
2. Run these commands:
    2.1. mkcert -install
    2.2. mkcert localhost 127.0.0.1 ::1

!!! 
The 'start' script in package.json should be:
set HTTPS=true&&set SSL_CRT_FILE=localhost+2.pem&&set SSL_KEY_FILE=localhost+2-key.pem&&react-scripts start 
!!!