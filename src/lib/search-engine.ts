interface SearchDocument {
  id: string
  [key: string]: any
}

interface SearchOptions {
  limit?: number
  attributesToRetrieve?: string[]
  attributesToHighlight?: string[]
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface SearchResult {
  hits: SearchDocument[]
  query: string
  processingTimeMs: number
  estimatedTotalHits: number
}

class CustomSearchEngine {
  private indexes: Map<string, Map<string, SearchDocument>> = new Map()
  private searchableAttributes: Map<string, string[]> = new Map()
  private filterableAttributes: Map<string, string[]> = new Map()
  private sortableAttributes: Map<string, string[]> = new Map()

  createIndex(indexName: string): void {
    if (!this.indexes.has(indexName)) {
      this.indexes.set(indexName, new Map())
      this.searchableAttributes.set(indexName, [])
      this.filterableAttributes.set(indexName, [])
      this.sortableAttributes.set(indexName, [])
    }
  }

  updateSearchableAttributes(indexName: string, attributes: string[]): void {
    this.searchableAttributes.set(indexName, attributes)
  }

  updateFilterableAttributes(indexName: string, attributes: string[]): void {
    this.filterableAttributes.set(indexName, attributes)
  }

  updateSortableAttributes(indexName: string, attributes: string[]): void {
    this.sortableAttributes.set(indexName, attributes)
  }

  addDocuments(indexName: string, documents: SearchDocument[]): void {
    const index = this.indexes.get(indexName)
    if (!index) throw new Error(`Index ${indexName} not found`)

    documents.forEach(doc => {
      index.set(doc.id, { ...doc })
    })
  }

  deleteAllDocuments(indexName: string): void {
    const index = this.indexes.get(indexName)
    if (index) {
      index.clear()
    }
  }

  search(indexName: string, query: string, options: SearchOptions = {}): SearchResult {
    const startTime = Date.now()
    const index = this.indexes.get(indexName)
    
    if (!index) {
      throw new Error(`Index ${indexName} not found`)
    }

    const {
      limit = 20,
      attributesToRetrieve,
      attributesToHighlight = [],
      filters = {},
      sortBy,
      sortOrder = 'desc'
    } = options

    let results = Array.from(index.values())

    // Apply filters
    if (Object.keys(filters).length > 0) {
      results = results.filter(doc => {
        return Object.entries(filters).every(([key, value]) => {
          return doc[key] === value
        })
      })
    }

    // Search logic
    if (query.trim()) {
      const searchableAttrs = this.searchableAttributes.get(indexName) || []
      const queryLower = query.toLowerCase()
      
      results = results
        .map(doc => {
          let score = 0
          const matchedFields: string[] = []

          searchableAttrs.forEach(attr => {
            const value = String(doc[attr] || '').toLowerCase()
            
            // Exact match (highest score)
            if (value === queryLower) {
              score += 100
              matchedFields.push(attr)
            }
            // Starts with query (high score)
            else if (value.startsWith(queryLower)) {
              score += 50
              matchedFields.push(attr)
            }
            // Contains query (medium score)
            else if (value.includes(queryLower)) {
              score += 25
              matchedFields.push(attr)
            }
            // Fuzzy match (low score)
            else if (this.fuzzyMatch(value, queryLower)) {
              score += 10
              matchedFields.push(attr)
            }
          })

          return { ...doc, _score: score, _matchedFields: matchedFields }
        })
        .filter(doc => doc._score > 0)
        .sort((a, b) => b._score - a._score)
    }

    // Apply sorting if specified
    if (sortBy && this.sortableAttributes.get(indexName)?.includes(sortBy)) {
      results.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    // Apply limit
    results = results.slice(0, limit)

    // Apply attribute filtering and highlighting
    const hits = results.map(doc => {
      let result: any = {}
      
      if (attributesToRetrieve) {
        attributesToRetrieve.forEach(attr => {
          if (doc[attr] !== undefined) {
            result[attr] = doc[attr]
          }
        })
      } else {
        result = { ...doc }
        delete result._score
        delete result._matchedFields
      }

      // Add highlighting
      if (attributesToHighlight.length > 0 && query.trim()) {
        const _formatted: any = {}
        attributesToHighlight.forEach(attr => {
          if (doc[attr]) {
            _formatted[attr] = this.highlightText(String(doc[attr]), query)
          }
        })
        if (Object.keys(_formatted).length > 0) {
          result._formatted = _formatted
        }
      }

      return result
    })

    const processingTimeMs = Date.now() - startTime

    return {
      hits,
      query,
      processingTimeMs,
      estimatedTotalHits: hits.length
    }
  }

  private fuzzyMatch(text: string, query: string): boolean {
    if (query.length === 0) return true
    if (text.length === 0) return false

    const threshold = 0.7
    const distance = this.levenshteinDistance(text, query)
    const maxLength = Math.max(text.length, query.length)
    const similarity = 1 - (distance / maxLength)
    
    return similarity >= threshold
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  private highlightText(text: string, query: string): string {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  getStats(indexName: string) {
    const index = this.indexes.get(indexName)
    return {
      numberOfDocuments: index?.size || 0,
      isIndexing: false,
      fieldDistribution: {}
    }
  }
}

// Singleton instance
export const searchEngine = new CustomSearchEngine()

// Initialize users index
searchEngine.createIndex('users')
searchEngine.updateSearchableAttributes('users', ['name', 'email'])
searchEngine.updateFilterableAttributes('users', ['id'])
searchEngine.updateSortableAttributes('users', ['name', 'createdAt'])