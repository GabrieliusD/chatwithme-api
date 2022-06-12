const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ["query"] });
const router = require("express").Router();
const { ensureAuth } = require("../middleware/auth.js");
//create conversation
router.post("/create", ensureAuth, async (req, res) => {
  const { user2 } = req.body;
  const user1 = req.user.id;
  if (user1 === user2)
    return res
      .status(400)
      .json({ error: "Cannot create conversation with same user" });
  console.log(req.user);
  console.log(req.body);
  if ((!user1, !user2)) return res.status(400).send("user missing");

  const userprofile1 = await prisma.user.findUnique({ where: { id: user1 } });
  const userprofile2 = await prisma.user.findUnique({ where: { id: user2 } });

  if ((!userprofile1, !userprofile2))
    return res.status(400).send("user doesnt exist");

  console.log(user1, user2);
  const inbox = await prisma.inbox.create({
    data: {
      Inbox_Participants: {
        create: [
          {
            userId: user1,
          },
          {
            userId: user2,
          },
        ],
      },
    },
  });

  res.status(200).json(inbox);
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
  let inboxArray = [];
  console.log("convos" + convos);
  if (!convos) return res.status(400).json({ error: "No Conversations" });
  convos.forEach((element) => {
    let inbox = {};
    inbox.id = element.inboxId;
    inbox.last_message = element.inbox_uid.last_message;
    inbox.last_user_id = element.inbox_uid.userId;
    inbox.participants = [];
    element.inbox_uid.Inbox_Participants.forEach((participant) => {
      inbox.participants.push(participant.user_id);
    });
    inboxArray.push(inbox);
  });
  console.log(inboxArray);
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

router.get("/:convoId", ensureAuth, async (req, res) => {
  const { convoId } = req.params;
  const userId = req.user.id;
  console.log(userId);
  const participants = await prisma.Inbox_Participants.findMany({
    where: {
      inboxId: parseInt(convoId),
    },
  });
  let containsUser;
  participants.forEach((value) => {
    if (value.userId === userId) {
      containsUser = true;
    }
  });
  console.log(participants);
  if (!containsUser) return res.status(400).json("the user is not in convo");

  const messages = await prisma.message.findMany({
    where: {
      inboxId: parseInt(convoId),
    },
  });

  res.status(200).json(messages);
});

router.post("/:convoId", ensureAuth, async (req, res) => {
  console.log(req.params);
  const convoId = parseInt(req.params.convoId);
  const userId = req.user.id;
  const { text } = req.body;

  const participants = await prisma.Inbox_Participants.findMany({
    where: {
      inboxId: convoId,
    },
  });
  let containsUser;
  participants.forEach((value) => {
    if (value.userId === userId) {
      containsUser = true;
    }
  });
  if (!containsUser) return res.status(400).json("the user is not in convo");

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      text,
      inboxId: parseInt(convoId),
    },
  });

  return res.status(200).json(message);
});
module.exports = router;
