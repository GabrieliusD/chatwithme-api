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

const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const userId = req.user.id;

    cb(
      null,
      `${new Date().getTime().toString()}-${userId}${path.extname(
        file.originalname
      )}`
    );
  },
});
var upload = multer({ storage: storage });

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    console.log("using local strategy");
    const user = await prisma.user.findFirst({ where: { username } });
    console.log(username);
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
        console.log(user);
        return cb(null, user);
      }
    );
  })
);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, {
      id: user.id,
      username: user.username,
      profileImage: user.image,
    });
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
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
    origin: "http://localhost:3000",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static("uploads"));
//app.use(express.static(__dirname, "public"));
const sessionMiddleware = session({
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
});
//app.use("/users", usersRoute);
app.use(sessionMiddleware);
app.use(passport.authenticate("session"));
app.use("/users", userRoute);
app.use("/convo", convoRoute);
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req.file);
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false,
    });
  } else {
    console.log("file received");

    try {
      const updateUser = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          image: req.file.filename,
        },
      });
    } catch (error) {
      return res.send({
        success: false,
      });
    }

    return res.send({
      image: req.file.filename,
      success: true,
    });
  }
});
app.get("/", (req, res) => {
  res.json({ message: "main page" });
});

app.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/users/owner/self/",
    failureRedirect: "/test",
  })
);

app.post("/signup", async (req, res, next) => {
  console.log("signup");
  const salt = crypto.randomBytes(16);
  const { username, password, email } = req.body;
  if ((!username, !password, !email)) return next("missing field");
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
      let user = {};
      try {
        user = await prisma.user.create({
          data: {
            username,
            password: hashedPassword.toString("hex"),
            salt: salt.toString("hex"),
            email,
          },
        });
      } catch (error) {
        return next(error);
      }

      if (!user) next("no user");
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
    console.log(req.sessionID);
    res.status(200).send("authenticated");
  } else {
    res.send("unauthenticated");
  }
});

let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
const removeUser = (userId) => {
  users = users.filter((user) => user.socketId !== userId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
  console.log("socket session id ", socket.request.sessionID);
  if (socket.request.user) {
    console.log("User web connection authenticated for ", socket.request.user);
    next();
  } else {
    console.log("Invalid user");
    next(new Error("unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("client connected");
  addUser(userId, socket.request.user.id);

  io.emit("getUsers", users);
  socket.on("addUser", (userId) => {
    console.log(users);
  });
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log(users);
    const user = getUser(receiverId);
    console.log(senderId, receiverId, text, user);
    if (!user) {
      console.log("no user");
      return;
    }
    console.log("message send: ", user.socketId, senderId, text);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });
  socket.on("disconnect", () => {
    console.log("user left");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running, port: " + PORT);
});
