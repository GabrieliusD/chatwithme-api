const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();
const { ensureAuth } = require("../middleware/auth.js");

router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if ((!username, !password, !email))
      return res.status(400).send("missing fields");

    await prisma.user.create({
      data: {
        username,
        password,
        email,
      },
    });
    res.status(200).send("data created");
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { username, password } = res.body;
    if ((!username, !password)) return res.status(400).send("Missing fields");

    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log(username);
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: username,
      },
    },
  });
  res.status(200).json(users);
});

router.get("/owner/self", (req, res) => {
  if (!req.user) return res.status(400).json({ error: "user not found" });
  console.log(req.user);
  return res.status(200).json(req.user);
});

module.exports = router;
