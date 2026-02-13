/**
 * Unified Search Service
 * Exports search functions and types
 */

export {
  searchAll,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  TYPE_LABELS,
} from './service'
export type {
  SearchResultType,
  SearchResult,
  SearchResultGroup,
  SearchScope,
  SearchOptions,
} from './service'
