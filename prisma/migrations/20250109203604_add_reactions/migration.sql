/*
  Warnings:

  - A unique constraint covering the columns `[userId,messageId,emoji]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Reaction_messageId_userId_emoji_key";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT,
    "toUserId" TEXT,
    "parentId" TEXT,
    "isThread" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Message_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Message_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("channelId", "content", "createdAt", "id", "toUserId", "updatedAt", "userId") SELECT "channelId", "content", "createdAt", "id", "toUserId", "updatedAt", "userId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_messageId_emoji_key" ON "Reaction"("userId", "messageId", "emoji");
