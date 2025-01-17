-- Add bot user
INSERT INTO "User" (id, email, displayName, imageUrl, "lastSyncedAt", "createdAt", "updatedAt")
VALUES (
  'bot',
  'bot@gauntletchat.com',
  'GauntletChat Bot',
  'https://api.dicebear.com/6.x/bottts/svg?seed=GauntletBot',
  NOW(),
  NOW(),
  NOW()
); 