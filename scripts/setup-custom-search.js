const { searchService } = require('../src/lib/search-service')

async function setupCustomSearch() {
  try {
    console.log('Setting up custom search engine...')
    
    // Initialize the search service
    await searchService.initialize()
    
    console.log('Custom search engine setup completed successfully!')
    console.log('Search engine stats:', searchService.getIndexStats())
    
  } catch (error) {
    console.error('Error setting up custom search engine:', error)
    process.exit(1)
  }
}

setupCustomSearch()