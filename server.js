const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());              // lets us read JSON sent by the browser
app.use(express.static("public"));    // serves public/index.html as the website

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const users = {};                     // username -> hashed password (resets on restart)

// ---- AUTH ----
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6)
    return res.status(400).json({ error: "Username and password (min 6 chars) required" });
  if (users[username]) return res.status(409).json({ error: "User already exists" });
  users[username] = await bcrypt.hash(password, 10);   // never store plain passwords
  res.json({ message: "Registered! Now log in." });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const hash = users[username];
  if (!hash || !(await bcrypt.compare(password, hash)))
    return res.status(401).json({ error: "Wrong username or password" });
  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// middleware: runs before protected routes and checks the token
function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Please log in" });
  }
}

// ---- PROTECTED API: calls an external API ----
app.get("/api/weather", requireAuth, async (req, res) => {
  try {
    const city = req.query.city;
    // 1) city name -> latitude/longitude
    const geo = await (await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    )).json();
    if (!geo.results) return res.status(404).json({ error: "City not found" });
    const { latitude, longitude, name, country } = geo.results[0];
    // 2) lat/long -> current weather
    const w = await (await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    )).json();
    res.json({ city: name, country, ...w.current_weather });
  } catch (e) {
    res.status(500).json({ error: "Weather service failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on http://localhost:" + PORT));
