-- AlterTable
CREATE SEQUENCE "inbox_participants_id_seq";
ALTER TABLE "Inbox_Participants" ALTER COLUMN "id" SET DEFAULT nextval('inbox_participants_id_seq');
ALTER SEQUENCE "inbox_participants_id_seq" OWNED BY "Inbox_Participants"."id";
