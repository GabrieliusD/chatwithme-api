const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();
const { ensureAuth } = require("../middleware/auth.js");

router.post("/create", ensureAuth, async (req, res) => {
  const { user2 } = req.body;
  const user1 = req.user.id;
  console.log(req.user);
  console.log(req.body);
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

router.get("/", ensureAuth, async (req, res) => {
  const userId = req.user.id;
  const convos = await prisma.user.findFirst({
    where: { id: userId },
    include: { conversations: true, user: true },
  });

  res.status(200).json(convos);
});

router.get("/inbox", async (req, res) => {
  const inbox = await prisma.inbox.create({
    data: {
      id: 5,
      last_sent_user_id: {
        connect: { id: "578dc75b-c491-4b13-94ef-f25d96b48480" },
      },
      Inbox_Participants: {
        create: [
          {
            user_id: {
              connect: { id: "578dc75b-c491-4b13-94ef-f25d96b48480" },
            },
          },
          {
            user_id: {
              connect: { id: "578dc75b-c491-4b13-94ef-f25d96b48480" },
            },
          },
        ],
      },
    },
  });
  res.json(inbox);
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
