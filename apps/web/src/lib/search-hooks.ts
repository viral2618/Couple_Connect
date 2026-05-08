import { searchService } from './search-service'

export class SearchHooks {
  static async onUserCreated(user: { id: string; name: string; email: string; avatar?: string; createdAt?: Date; isVerified?: boolean }) {
    try {
      await searchService.addUser(user)
    } catch (error) {
      console.error('Failed to add user to search index:', error)
    }
  }

  static async onUserUpdated(user: { id: string; name: string; email: string; avatar?: string; createdAt?: Date; isVerified?: boolean }) {
    try {
      // For updates, we'll do a full sync to ensure consistency
      // In a production environment, you might want to implement a more efficient update mechanism
      await searchService.syncUsers()
    } catch (error) {
      console.error('Failed to update user in search index:', error)
    }
  }

  static async onUserDeleted(userId: string) {
    try {
      await searchService.removeUser(userId)
    } catch (error) {
      console.error('Failed to remove user from search index:', error)
    }
  }

  // Auto-sync every 5 minutes to ensure data consistency
  static startAutoSync() {
    setInterval(async () => {
      try {
        console.log('Running auto-sync...')
        const result = await searchService.syncUsers()
        if (result.success) {
          console.log(`Auto-sync completed: ${result.count} users indexed`)
        } else {
          console.error('Auto-sync failed:', result.error)
        }
      } catch (error) {
        console.error('Auto-sync error:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes
  }
}

// Start auto-sync when the module is loaded
if (typeof window === 'undefined') { // Only on server side
  SearchHooks.startAutoSync()
}