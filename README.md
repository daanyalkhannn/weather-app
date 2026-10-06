# Weather App with Login

A small full-stack project to learn Git, APIs, authentication, Docker and deployment.

## How it works (the big picture)

```
Browser (public/index.html)  <-->  Your server (server.js)  <-->  Open-Meteo API
   forms + buttons                 login, token check              gives weather data
```

1. You register -> the browser sends username/password to `POST /api/register`.
2. The server **hashes** the password (bcrypt) and stores it. Plain passwords are never saved.
3. You log in -> `POST /api/login`. If the password matches, the server creates a **JWT token** (a signed proof of "this is user X") and sends it back.
4. The browser saves the token (localStorage) and sends it in the `Authorization` header with every request.
5. You search a city -> `GET /api/weather?city=...`. The `requireAuth` middleware checks the token. If valid, the server calls the **Open-Meteo API** twice (city -> coordinates -> weather) and returns the result.

## Files explained

| File | Purpose |
|---|---|
| `package.json` | Project name and list of libraries (dependencies) |
| `server.js` | The backend: routes, auth, external API calls |
| `public/index.html` | The frontend: HTML + CSS + JS in one file |
| `Dockerfile` | Recipe to package the app into a container |
| `.gitignore` | Files Git should NOT upload (node_modules, secrets) |
| `.dockerignore` | Same idea, for Docker |

Libraries: **express** (web server), **bcryptjs** (password hashing), **jsonwebtoken** (JWT tokens).

## Run locally

Install Node.js (v18+) first, then:

```bash
npm install
npm start
```
Open http://localhost:3000

## Run with Docker

```bash
docker build -t weather-app .
docker run -p 3000:3000 weather-app
```
- `build` makes an image (the packaged app) following the Dockerfile.
- `run` starts a container from it. `-p 3000:3000` maps your PC's port 3000 to the container's.

## Git and GitHub

```bash
git init                      # start tracking this folder
git add .                     # stage all files
git commit -m "Initial commit"   # save a snapshot
```
Create an empty repo on github.com (no README), then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/weather-app.git
git branch -M main
git push -u origin main       # upload
```
Later, after changing code: `git add .`, `git commit -m "what changed"`, `git push`.

## Deploy on Render (free)

1. Sign up at render.com with your GitHub account.
2. New -> Web Service -> select your repo.
3. Runtime: Node, Build command: `npm install`, Start command: `npm start`
   (or choose Docker and it will use your Dockerfile).
4. Under Environment, add `JWT_SECRET` = any long random string.
5. Deploy. You get a public URL.

**Real-time updates:** every `git push` to `main` makes Render redeploy automatically (this is called CI/CD).

## Known limitations (good "next steps")

- Users are stored in memory, so they vanish on restart. Next step: add a database (SQLite or MongoDB).
- Add a "favorite cities" feature per user.
- Add rate limiting and input validation.
