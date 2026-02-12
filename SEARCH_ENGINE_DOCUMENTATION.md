# High-Performance Search Engine with Natural Language Parsing

## 🚀 Overview
Issue #634 implements a state-of-the-art search engine for transactions, moving beyond basic filtering to a system that understands natural language queries and provides deep analytical facets.

## 🏗️ Architecture

### 1. Smart Query Parser (`utils/queryParser.js`)
The core of the system is a regex-based parser that handles:
- **Keys**: `category:food`, `merchant:"Apple Store"`, `date:last-month`.
- **Amount Operators**: `>500`, `<=120`, `25.50` (defaults to equals).
- **Text Search**: Any non-key text is treated as a full-text search query.
- **Date Presets**: `today`, `yesterday`, `this-week`, `last-week`, `this-month`, `last-month`.

### 2. Search Service (`services/searchService.js`)
Uses MongoDB Aggregation Pipelines to:
- Combine text search relevance with structured filters.
- Generate **Facets**: Category distribution and top merchants for the current search context.
- Handle high-performance pagination.

### 3. Efficiency & Caching (`middleware/cache.js`)
A simple, thread-safe in-memory cache middleware stores frequent search results.
- **TTL**: 5 minutes (configurable).
- **Max Size**: 1000 items with basic eviction.
- **Bypass**: Non-200 responses are never cached.

### 4. Optimized Indexing (`models/Transaction.js`)
Added critical indexes to ensure sub-100ms response times:
- `description: 'text', merchant: 'text'`: Multi-field text index for global search.
- `user: 1, amount: 1`: Optimized B-tree for numerical range queries.

## 🛠️ API Reference

### `GET /api/search/smart?q={query}`
**Example Queries**:
- `q=category:food >500 pizza` (Find food expenses over 500 containing "pizza")
- `q=date:last-month merchant:Amazon` (Find all Amazon purchases from last month)

**Sample Response**:
```json
{
  "success": true,
  "data": [...],
  "facets": {
    "categories": [{ "_id": "food", "count": 12, "totalAmount": 4500 }],
    "merchants": [{ "_id": "Amazon", "count": 5 }]
  },
  "pagination": { "total": 45, "page": 1, "limit": 50, "pages": 1 }
}
```

### `GET /api/search/merchants?name={partial}`
Fuzzy search for merchant names to power UI autocomplete.

## ✅ Verification
1. Run the test suite:
   ```bash
   npm test tests/search.test.js
   ```
2. Verify indexing in MongoDB Shell:
   ```javascript
   db.transactions.getIndexes()
   ```
