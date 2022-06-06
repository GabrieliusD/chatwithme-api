const userRoute = require("./routes/user.routes");
const convoRoute = require("./routes/conversation.routes");
const usersRoute = require("./routes/users.routes");
const express = require("express");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) return cb(null, false, { message: "no user" });
    const buffsalt = Buffer.from(user.salt, "hex");
    crypto.pbkdf2(
      password,
      buffsalt,
      310000,
      32,
      "sha256",
      function (err, hashedPassword) {
        if (err) {
          return cb(err);
        }
        let buffpass = Buffer.from(user.password, "hex");
        console.log(user.password);
        console.log(hashedPassword.toString("hex"));
        if (!crypto.timingSafeEqual(buffpass, hashedPassword)) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        return cb(null, user);
      }
    );
  })
);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

const cors = require("cors");
const { Server } = require("socket.io");
const { nextTick, emitWarning } = require("process");
app.use(cors());
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.json());
app.use("/users", userRoute);
app.use("/convo", convoRoute);
//app.use("/users", usersRoute);
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: "test",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdFunction: undefined,
      dbRecordIdIsSessionId: true,
    }),
  })
);
app.use(passport.authenticate("session"));

app.get("/", (req, res) => {
  res.json({ message: "main page" });
});

app.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/test",
  })
);

app.post("/signup", async (req, res, next) => {
  const salt = crypto.randomBytes(16);
  const { username, password } = req.body;

  crypto.pbkdf2(
    password,
    salt,
    310000,
    32,
    "sha256",
    async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword.toString("hex"),
          salt: salt.toString("hex"),
          email: "test123",
        },
      });

      if (!user) return res.send("no user");
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    }
  );
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.get("/test", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).send("authenticated");
  } else {
    res.send("unauthenticated");
  }
});

io.on("connection", (socket) => {
  console.log("client connected");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server running, port: " + PORT);
});
