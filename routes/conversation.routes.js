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
  console.log(userId);
  const convos = await prisma.inbox_Participants.findMany({
    where: {
      userId,
    },
    include: {
      inbox_uid: {
        include: {
          Inbox_Participants: {
            where: { NOT: { userId } },
            include: { user_id: { select: { username: true, id: true } } },
          },
        },
      },
    },
  });
  console.log(convos, convos[3].inbox_uid.Inbox_Participants);

  let inboxArray = [];

  convos.forEach((element) => {
    let inbox = {};
    inbox.last_message = element.inbox_uid.last_message;
    inbox.last_user_id = element.inbox_uid.userId;
    inbox.participants = [];
    element.inbox_uid.Inbox_Participants.forEach((participant) => {
      inbox.participants.push(participant.user_id);
    });
    inboxArray.push(inbox);
  });

  res.json(inboxArray);
});

router.get("/inbox", async (req, res) => {
  const { user2 } = req.body;
  const user1 = req.user.id;
  console.log(req.user);
  console.log(req.body);
  if ((!user1, !user2)) return res.status(400).send("user missing");

  const userprofile1 = await prisma.user.findUnique({ where: { id: user1 } });
  const userprofile2 = await prisma.user.findUnique({ where: { id: user2 } });
  if ((!userprofile1, !userprofile2))
    return res.status(400).send("user doesnt exist");

  const inbox = await prisma.inbox.create({
    data: {
      Inbox_Participants: {
        create: [
          {
            user_id: {
              connect: { id: user1 },
            },
          },
          {
            user_id: {
              connect: { id: user2 },
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
