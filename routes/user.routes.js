const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();

router.get("/register", async (req, res) => {
  //const{username, password } = req.body;
  await prisma.user.create({
    data: {
      username: "test",
      password: "test",
      email: "test",
    },
  });
  res.json("user created");
});
router.post("/login", (req, res) => {});

router.get("/", async (req, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

module.exports = router;
