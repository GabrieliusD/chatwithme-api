const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();

router.get("/:username", async (req, res) => {
  const { username } = req.params;
  console.log(username);
  const users = await prisma.user.findMany();
  console.log(users);
  res.status(200).json(users);
});

module.exports = router;
