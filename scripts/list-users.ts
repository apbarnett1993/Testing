async function listUsers() {
  try {
    const secretKey = 'sk_test_iNVzR4hKA4CuTOZpEzUZUCz9zI4KCbfJBbDlSQOiav';
    console.log('Attempting to fetch users...');
    
    const response = await fetch('https://api.clerk.dev/v1/users', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch users: ${errorText}`);
    }

    const users = await response.json();
    console.log('\nAll Users from Clerk API:');
    users.forEach((user: any) => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email_addresses[0]?.email_address || 'No email'}`);
      console.log('');
    });

    // Also check what the /api/users endpoint is returning
    console.log('\nChecking /api/users endpoint:');
    const apiResponse = await fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      }
    });
    const apiUsers = await apiResponse.json();
    console.log('API Users:', JSON.stringify(apiUsers, null, 2));

  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

listUsers(); 