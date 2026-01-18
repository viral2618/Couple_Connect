const { MeiliSearch } = require('meilisearch');
require('dotenv').config();

async function setupMeiliSearch() {
  try {
    const client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_MASTER_KEY,
    });

    console.log('Creating users index...');
    
    // Create the users index
    await client.createIndex('users', { primaryKey: '_id' });
    console.log('Users index created successfully');

    // Wait a moment for index to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the index reference
    const usersIndex = client.index('users');

    // Configure searchable attributes
    await usersIndex.updateSearchableAttributes([
      'username',
      'email',
      'firstName',
      'lastName',
      'bio'
    ]);

    // Configure filterable attributes
    await usersIndex.updateFilterableAttributes([
      'isOnline',
      'gender',
      'age',
      'location'
    ]);

    // Configure sortable attributes
    await usersIndex.updateSortableAttributes([
      'createdAt',
      'lastActive',
      'age'
    ]);

    console.log('MeiliSearch setup completed successfully!');
    
  } catch (error) {
    if (error.code === 'index_already_exists') {
      console.log('Users index already exists, updating configuration...');
      
      const usersIndex = client.index('users');
      await usersIndex.updateSearchableAttributes(['username', 'email', 'firstName', 'lastName', 'bio']);
      await usersIndex.updateFilterableAttributes(['isOnline', 'gender', 'age', 'location']);
      await usersIndex.updateSortableAttributes(['createdAt', 'lastActive', 'age']);
      
      console.log('Index configuration updated successfully!');
    } else {
      console.error('Error setting up MeiliSearch:', error);
      process.exit(1);
    }
  }
}

setupMeiliSearch();