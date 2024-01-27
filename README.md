# palworld-rcon-buddy

Secure API wrapper for Palworld RCON, run this parallel to your Palworld server to give a secure HTTP/JSON interface for managing your server.

It does support Bearer token authentication for extra security and public endpoint.

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
