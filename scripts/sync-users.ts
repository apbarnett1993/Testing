import 'dotenv/config';

async function syncUsers() {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables');
    }

    console.log('Starting user sync...');
    const authHeader = `Bearer ${process.env.CLERK_SECRET_KEY}`;
    console.log('Using auth header:', authHeader);
    
    const response = await fetch('http://localhost:3000/api/users/sync', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response text:', errorText);
      throw new Error(`Failed to sync users: ${errorText}`);
    }

    const result = await response.json();
    console.log('\nSync Results:');
    console.log(`- Synced ${result.count} users`);
    console.log('\nSynced Users:');
    result.users.forEach((user: any) => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.displayName || 'No display name'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error syncing users:', error);
    process.exit(1);
  }
}

// Run the sync
syncUsers(); 