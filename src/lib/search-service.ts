import { searchEngine } from './search-engine'
import { prisma } from './prisma'

export class SearchService {
  private static instance: SearchService
  private syncInProgress = false

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  async syncUsers(): Promise<{ success: boolean; count: number; error?: string }> {
    if (this.syncInProgress) {
      return { success: false, count: 0, error: 'Sync already in progress' }
    }

    try {
      this.syncInProgress = true
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          isVerified: true
        }
      })

      // Clear existing documents
      searchEngine.deleteAllDocuments('users')
      
      // Add new documents
      if (users.length > 0) {
        searchEngine.addDocuments('users', users)
      }

      return { success: true, count: users.length }
    } catch (error) {
      console.error('Failed to sync users:', error)
      return { 
        success: false, 
        count: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async searchUsers(query: string, options: {
    limit?: number
    attributesToRetrieve?: string[]
    attributesToHighlight?: string[]
  } = {}) {
    try {
      const result = searchEngine.search('users', query, {
        limit: options.limit || 10,
        attributesToRetrieve: options.attributesToRetrieve || ['id', 'name', 'email', 'avatar'],
        attributesToHighlight: options.attributesToHighlight || ['name', 'email']
      })

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('Search failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }
    }
  }

  async addUser(user: { id: string; name: string; email: string; avatar?: string; createdAt?: Date; isVerified?: boolean }) {
    try {
      searchEngine.addDocuments('users', [user])
      return { success: true }
    } catch (error) {
      console.error('Failed to add user to search index:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add user' }
    }
  }

  async removeUser(userId: string) {
    try {
      // Since we don't have a direct remove method, we'll need to resync
      // For now, we'll just trigger a full sync
      await this.syncUsers()
      return { success: true }
    } catch (error) {
      console.error('Failed to remove user from search index:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove user' }
    }
  }

  getIndexStats() {
    return searchEngine.getStats('users')
  }

  // Auto-sync on startup
  async initialize() {
    console.log('Initializing search service...')
    const result = await this.syncUsers()
    if (result.success) {
      console.log(`Search service initialized with ${result.count} users`)
    } else {
      console.error('Failed to initialize search service:', result.error)
    }
  }
}

export const searchService = SearchService.getInstance()

// Auto-initialize on server startup
if (typeof window === 'undefined') {
  searchService.initialize().catch(console.error)
}