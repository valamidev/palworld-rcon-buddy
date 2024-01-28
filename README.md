# Palworld Rcon Buddy

Secure HTTP API for Palworld Server RCON, run this parallel to your Palworld server to give a secure HTTP/JSON interface for managing your server.

It does support Bearer token authentication for extra security and public endpoint.

# How to attach Buddy to your Palworld server:

```
version: "3"
services:
  palworld:
    image: thijsvanloef/palworld-server-docker:latest
    restart: unless-stopped
    container_name: palworld-server
    ports:
      - 8211:8211/udp
      - 27015:27015/udp # Required if you want your server to show up in the community servers tab
      - 127.0.0.1:25575:25575 # RCON port
    environment:
      - PUID=1000
      - PGID=1000
      - PORT=8211 # Optional but recommended
      - PLAYERS=16 # Optional but recommended
      - SERVER_PASSWORD="worldofpals" # Optional but recommended
      - MULTITHREADING=true
      - RCON_ENABLED=true
      - RCON_PORT=25575
      - TZ=UTC
      - ADMIN_PASSWORD="adminPasswordHere" # RCON Password
      - COMMUNITY=false # Enable this if you want your server to show up in the community servers tab, USE WITH SERVER_PASSWORD!
      - SERVER_NAME="World of Pals"
      - SERVER_DESCRIPTION=""
    volumes:
      - ./palworld:/palworld/
  palworld-rcon-buddy:
    image: "valamidev/palworld-rcon-buddy:latest"
    environment:
      PALWORLD_SERVER_IP_ADDRESS: "palworld" # This is how you can refference the palworld container
      PALWORLD_RCON_PORT: "25575"
      PALWORLD_RCON_PASSWORD: "adminPasswordHere" # RCON Password
      INFO_CACHE_DURATION_MS: 5000 # By Default /info end-point is cached for 5 seconds
      BEARER_TOKEN: "YOUR_TOKEN"
      PORT: 3000 # RCON-BUDDY port
    ports:
      - "3000:3000"
```

# End-points

## GET /info

This endpoint is public and does not require authentication, it has a `INFO_CACHE_DURATION_MS` (default 5 seconds) to prevent spamming the server.

- `127.0.0.1:3000/info` - Return basic server information

```
{
"players":[{"name":"뜨거운 씽어즈","playeruid":"41XXXXX2","steamid":"765XXX"}],
"serverName":"Palworld Public Server",
"serverVersion":"v0.1.3.0"
}
```

## POST /command

- `127.0.0.1:3000/command` - Execute a command on the server

Example 1 - Get Info:

```
curl -X POST http://127.0.0.1:3000/command -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"command":"Info"}'
```

```
{
  "result": "Welcome to Pal Server[v0.1.3.0] Palworld Public Server\n"
}
```

Example 2 - Kick Player:

```
curl -X POST http://127.0.0.1:3000/command -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"command":"KickPlayer 41XXXXX2"}'
```

```
{
  "result": "Kicked: 41XXXXX2\n"
}
```

Example 3 - Ban Player:

```
curl -X POST http://127.0.0.1:3000/command -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"command":"BanPlayer 41XXXXX2"}'
```

```
{
  "result": "Banned: 41XXXXX2\n"
}
```
