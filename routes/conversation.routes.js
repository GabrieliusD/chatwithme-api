const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();

router.post("/create", async (req, res) => {
  const { user1, user2 } = req.body;

  if ((!user1, !user2)) return res.status(400).send("user missing");

  const userprofile1 = await prisma.user.findUnique({ where: { id: user1 } });
  const userprofile2 = await prisma.user.findUnique({ where: { id: user2 } });

  if ((!userprofile1, !userprofile2))
    return res.status(400).send("user doesnt exist");

  const convo = await prisma.conversation.create({
    data: {
      users: { connect: [{ id: user1 }, { id: user2 }] },
    },
  });

  res.status(200).json(convo);
});

router.get("/:userId", async (req, res) => {
  const { convoId } = req.params;
  const convos = await prisma.user.findFirst({
    where: { id: convoId },
    include: { conversations: true },
  });

  res.status(200).json(convos);
});

router.post("/:convoId", async (req, res) => {
  const { convoId } = req.params;
  const { text, senderId } = req.body;

  const message = await prisma.message.create({
    data: {
      senderId,
      text,
      conversationId: parseInt(convoId),
    },
  });

  res.status(200).json(message);
});

router.get("/c/:convoId", async (req, res) => {
  const { convoId } = req.params;

  const messages = await prisma.message.findMany({
    where: {
      conversationId: parseInt(convoId),
    },
  });

  res.status(200).json(messages);
});
module.exports = router;
