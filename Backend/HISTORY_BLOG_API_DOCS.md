# History & Blog API Documentation

This document provides comprehensive information about the History and Blog APIs implemented in the Aarohan Holidays backend.

## Table of Contents
- [History API](#history-api)
  - [Models](#history-model)
  - [Public Endpoints](#history-public-endpoints)
  - [Admin Endpoints](#history-admin-endpoints)
- [Blog API](#blog-api)
  - [Models](#blog-model)
  - [Public Endpoints](#blog-public-endpoints)
  - [Admin Endpoints](#blog-admin-endpoints)

---

## History API

### History Model

**File**: `Backend/models/history.js`

**Schema Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | History entry title (max 200 chars) |
| location | String | Yes | Location name |
| description | String | Yes | Short description |
| content | String | Yes | Main content/story |
| images | Array[String] | No | Cloudinary image URLs (max 5) |
| videoLink | String | No | YouTube video URL |
| featured | Boolean | No | Featured flag (default: false) |
| isActive | Boolean | No | Active status (default: true) |
| views | Number | No | View counter (default: 0) |
| slug | String | No | Auto-generated URL slug |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Update timestamp |

**Indexes**:
- Text search on: title, location, description, content
- Single index: location, createdAt
- Compound index: featured + isActive

**Features**:
- Auto-generates SEO-friendly slug from title
- Validates maximum 5 images
- Text search capabilities

---

### History Public Endpoints

#### 1. Get All Published Histories
**GET** `/api/history`

**Description**: Retrieve all active history entries with filtering and pagination.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |
| location | String | - | Filter by location (regex) |
| featured | Boolean | - | Filter by featured status |
| search | String | - | Search in title, location, description |
| sortBy | String | createdAt | Sort field |
| sortOrder | String | desc | Sort order (asc/desc) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Ancient Temples of Kathmandu",
      "location": "Kathmandu",
      "description": "Explore the rich heritage...",
      "content": "Full content here...",
      "images": ["url1", "url2"],
      "videoLink": "https://youtube.com/...",
      "featured": true,
      "isActive": true,
      "views": 152,
      "slug": "ancient-temples-of-kathmandu",
      "createdAt": "2024-01-15T...",
      "updatedAt": "2024-01-15T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Status Codes**:
- 200: Success
- 500: Server error

---

#### 2. Get Single History by ID or Slug
**GET** `/api/history/:identifier`

**Description**: Retrieve a single history entry by MongoDB ID or slug. Increments view counter.

**Parameters**:
- `identifier`: MongoDB ObjectId or slug string

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Ancient Temples of Kathmandu",
    "location": "Kathmandu",
    "description": "Explore the rich heritage...",
    "content": "Full content here...",
    "images": ["url1", "url2"],
    "videoLink": "https://youtube.com/...",
    "featured": true,
    "isActive": true,
    "views": 153,
    "slug": "ancient-temples-of-kathmandu",
    "createdAt": "2024-01-15T...",
    "updatedAt": "2024-01-15T..."
  }
}
```

**Status Codes**:
- 200: Success
- 404: History not found
- 500: Server error

---

#### 3. Get Featured Histories
**GET** `/api/history/featured`

**Description**: Retrieve featured history entries for homepage highlights.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 6 | Maximum items to return |

**Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 6
}
```

**Status Codes**:
- 200: Success
- 500: Server error

---

#### 4. Get Unique Locations
**GET** `/api/history/locations`

**Description**: Retrieve list of unique location names for filter dropdowns.

**Response**:
```json
{
  "success": true,
  "data": [
    "Kathmandu",
    "Pokhara",
    "Lumbini",
    "Chitwan",
    "Everest"
  ]
}
```

**Status Codes**:
- 200: Success
- 500: Server error

---

### History Admin Endpoints

**Note**: All admin routes require authentication middleware (to be added).

#### 1. Create History Entry
**POST** `/api/admin/history`

**Description**: Create a new history entry.

**Request Body**:
```json
{
  "title": "Ancient Temples of Kathmandu",
  "location": "Kathmandu",
  "description": "Explore the rich heritage of Kathmandu's ancient temples",
  "content": "Full detailed content here...",
  "images": ["url1", "url2", "url3"],
  "videoLink": "https://youtube.com/watch?v=...",
  "featured": true,
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "History entry created successfully",
  "data": { /* created history object */ }
}
```

**Status Codes**:
- 201: Created successfully
- 400: Validation error

---

#### 2. Get All Histories (Admin)
**GET** `/api/admin/history`

**Description**: Retrieve all history entries with admin filters (includes inactive).

**Query Parameters**: Same as public endpoint, plus ability to filter by `isActive`

**Response**: Same structure as public endpoint

---

#### 3. Get History by ID (Admin)
**GET** `/api/admin/history/:id`

**Description**: Retrieve single history entry by ID (no view increment).

---

#### 4. Update History Entry
**PUT** `/api/admin/history/:id`

**Description**: Update an existing history entry.

**Request Body**: Any history fields to update

**Response**:
```json
{
  "success": true,
  "message": "History entry updated successfully",
  "data": { /* updated history object */ }
}
```

**Status Codes**:
- 200: Updated successfully
- 404: History not found
- 400: Validation error

---

#### 5. Delete History Entry
**DELETE** `/api/admin/history/:id`

**Description**: Permanently delete a history entry.

**Response**:
```json
{
  "success": true,
  "message": "History entry deleted successfully"
}
```

**Status Codes**:
- 200: Deleted successfully
- 404: History not found
- 500: Server error

---

#### 6. Toggle Featured Status
**PATCH** `/api/admin/history/:id/featured`

**Description**: Toggle the featured flag of a history entry.

**Response**:
```json
{
  "success": true,
  "message": "History entry featured successfully",
  "data": { /* updated history object */ }
}
```

---

#### 7. Toggle Active Status
**PATCH** `/api/admin/history/:id/active`

**Description**: Toggle the isActive flag (soft delete/publish).

**Response**:
```json
{
  "success": true,
  "message": "History entry activated successfully",
  "data": { /* updated history object */ }
}
```

---

## Blog API

### Blog Model

**File**: `Backend/models/blog.js`

**Schema Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | Blog title (max 200 chars) |
| subtitle | String | No | Blog subtitle (max 300 chars) |
| author | String | Yes | Author name (default: "Aarohan Holidays") |
| category | Enum | Yes | Blog category (11 options) |
| excerpt | String | Yes | Short excerpt (max 500 chars) |
| content | String | Yes | Full blog content |
| featuredImage | String | Yes | Cloudinary image URL |
| tags | Array[String] | No | Tags for taxonomy |
| readTime | Number | No | Estimated read time in minutes (default: 5) |
| featured | Boolean | No | Featured flag (default: false) |
| published | Boolean | No | Published status (default: false) |
| publishedAt | Date | Auto | Auto-set when published |
| views | Number | No | View counter (default: 0) |
| likes | Number | No | Like counter (default: 0) |
| slug | String | No | Auto-generated URL slug |
| metaDescription | String | No | SEO meta description (max 160 chars) |
| metaKeywords | Array[String] | No | SEO keywords |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Update timestamp |

**Categories**:
- Travel Tips
- Destinations
- Adventure
- Culture
- Food
- Trekking
- Wildlife
- Photography
- Budget Travel
- Luxury Travel
- Other

**Indexes**:
- Text search on: title, excerpt, content, tags
- Single index: category, publishedAt, createdAt
- Compound index: featured + published

**Features**:
- Auto-generates SEO-friendly slug from title
- Auto-sets publishedAt timestamp when published
- Category enum validation
- Text search capabilities

---

### Blog Public Endpoints

#### 1. Get All Published Blogs
**GET** `/api/blogs`

**Description**: Retrieve all published blog posts with filtering and pagination.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 12 | Items per page |
| category | String | - | Filter by category |
| featured | Boolean | - | Filter by featured status |
| tag | String | - | Filter by tag |
| search | String | - | Search in title, excerpt, tags |
| sortBy | String | publishedAt | Sort field |
| sortOrder | String | desc | Sort order (asc/desc) |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Top 10 Trekking Destinations in Nepal",
      "subtitle": "Discover the best trekking routes",
      "author": "Aarohan Holidays",
      "category": "Trekking",
      "excerpt": "Nepal is home to some of the world's best...",
      "content": "Full content here...",
      "featuredImage": "url",
      "tags": ["trekking", "nepal", "adventure"],
      "readTime": 8,
      "featured": true,
      "published": true,
      "publishedAt": "2024-01-15T...",
      "views": 245,
      "likes": 32,
      "slug": "top-10-trekking-destinations-in-nepal",
      "metaDescription": "Explore Nepal's best trekking destinations",
      "metaKeywords": ["trekking", "nepal"],
      "createdAt": "2024-01-15T...",
      "updatedAt": "2024-01-15T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 120,
    "itemsPerPage": 12,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Status Codes**:
- 200: Success
- 500: Server error

---

#### 2. Get Single Blog by ID or Slug
**GET** `/api/blogs/:identifier`

**Description**: Retrieve a single blog post by MongoDB ID or slug. Increments view counter.

**Parameters**:
- `identifier`: MongoDB ObjectId or slug string

**Response**:
```json
{
  "success": true,
  "data": { /* blog object */ }
}
```

**Status Codes**:
- 200: Success
- 404: Blog not found
- 500: Server error

---

#### 3. Get Featured Blogs
**GET** `/api/blogs/featured`

**Description**: Retrieve featured blog posts for homepage highlights.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 6 | Maximum items to return |

**Response**:
```json
{
  "success": true,
  "data": [...],
  "count": 6
}
```

---

#### 4. Get Latest Blogs
**GET** `/api/blogs/latest`

**Description**: Retrieve latest published blog posts (useful for sidebar).

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 5 | Maximum items to return |

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "title": "...",
      "slug": "...",
      "excerpt": "...",
      "featuredImage": "...",
      "author": "...",
      "publishedAt": "...",
      "category": "...",
      "readTime": 5
    }
  ],
  "count": 5
}
```

---

#### 5. Get Blog Categories
**GET** `/api/blogs/categories`

**Description**: Retrieve list of all categories used in published blogs.

**Response**:
```json
{
  "success": true,
  "data": [
    "Adventure",
    "Culture",
    "Destinations",
    "Food",
    "Trekking",
    "Travel Tips"
  ]
}
```

---

#### 6. Get Popular Tags
**GET** `/api/blogs/tags/popular`

**Description**: Retrieve popular tags with usage counts.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 20 | Maximum tags to return |

**Response**:
```json
{
  "success": true,
  "data": [
    { "tag": "trekking", "count": 45 },
    { "tag": "nepal", "count": 38 },
    { "tag": "adventure", "count": 32 }
  ]
}
```

---

#### 7. Like a Blog Post
**POST** `/api/blogs/:id/like`

**Description**: Increment the like counter for a blog post.

**Response**:
```json
{
  "success": true,
  "message": "Blog liked successfully",
  "data": {
    "likes": 33
  }
}
```

**Status Codes**:
- 200: Success
- 404: Blog not found
- 500: Server error

---

### Blog Admin Endpoints

**Note**: All admin routes require authentication middleware (to be added).

#### 1. Create Blog Post
**POST** `/api/admin/blogs`

**Description**: Create a new blog post.

**Request Body**:
```json
{
  "title": "Top 10 Trekking Destinations in Nepal",
  "subtitle": "Discover the best trekking routes",
  "author": "Aarohan Holidays",
  "category": "Trekking",
  "excerpt": "Nepal is home to some of the world's best trekking destinations...",
  "content": "Full blog content here with rich formatting...",
  "featuredImage": "cloudinary-url",
  "tags": ["trekking", "nepal", "adventure", "mountains"],
  "readTime": 8,
  "featured": false,
  "published": false,
  "metaDescription": "Explore Nepal's best trekking destinations",
  "metaKeywords": ["trekking", "nepal", "himalayas"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": { /* created blog object */ }
}
```

**Status Codes**:
- 201: Created successfully
- 400: Validation error

---

#### 2. Get All Blogs (Admin)
**GET** `/api/admin/blogs`

**Description**: Retrieve all blog posts with admin filters (includes drafts).

**Query Parameters**: Same as public endpoint, plus ability to filter by `published`

---

#### 3. Get Blog by ID (Admin)
**GET** `/api/admin/blogs/:id`

**Description**: Retrieve single blog post by ID (no view increment).

---

#### 4. Update Blog Post
**PUT** `/api/admin/blogs/:id`

**Description**: Update an existing blog post.

**Request Body**: Any blog fields to update

**Response**:
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": { /* updated blog object */ }
}
```

**Status Codes**:
- 200: Updated successfully
- 404: Blog not found
- 400: Validation error

---

#### 5. Delete Blog Post
**DELETE** `/api/admin/blogs/:id`

**Description**: Permanently delete a blog post.

**Response**:
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

**Status Codes**:
- 200: Deleted successfully
- 404: Blog not found
- 500: Server error

---

#### 6. Toggle Published Status
**PATCH** `/api/admin/blogs/:id/published`

**Description**: Toggle the published flag. Auto-sets publishedAt timestamp when publishing.

**Response**:
```json
{
  "success": true,
  "message": "Blog post published successfully",
  "data": { /* updated blog object */ }
}
```

---

#### 7. Toggle Featured Status
**PATCH** `/api/admin/blogs/:id/featured`

**Description**: Toggle the featured flag.

**Response**:
```json
{
  "success": true,
  "message": "Blog post featured successfully",
  "data": { /* updated blog object */ }
}
```

---

## Testing the APIs

### Using Postman or Thunder Client

1. **Import the collection** (create one with all endpoints above)
2. **Set base URL**: `http://localhost:5000`
3. **Test order**:
   - Start with admin endpoints to create content
   - Test public endpoints to verify visibility
   - Test filtering and pagination
   - Test toggle endpoints

### Example cURL Commands

**Create a history entry**:
```bash
curl -X POST http://localhost:5000/api/admin/history \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ancient Temples of Kathmandu",
    "location": "Kathmandu",
    "description": "Explore the rich heritage",
    "content": "Full content here...",
    "images": ["url1", "url2"],
    "featured": true
  }'
```

**Get all published histories**:
```bash
curl http://localhost:5000/api/history?page=1&limit=10
```

**Create a blog post**:
```bash
curl -X POST http://localhost:5000/api/admin/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Top 10 Trekking Destinations",
    "category": "Trekking",
    "excerpt": "Discover the best trekking routes",
    "content": "Full content...",
    "featuredImage": "url",
    "published": true
  }'
```

---

## Implementation Checklist

### Backend (Completed ✅)
- [x] History Model created
- [x] Blog Model created
- [x] History Controller with 11 functions
- [x] Blog Controller with 14 functions
- [x] History Routes file
- [x] Blog Routes file
- [x] Routes integrated into server.js

### Next Steps (To Do)
- [ ] Add authentication middleware for admin routes
- [ ] Test all endpoints with Postman
- [ ] Create admin panel UI for History management
- [ ] Create admin panel UI for Blog management
- [ ] Create public History pages (listing + detail)
- [ ] Create public Blog pages (listing + detail)
- [ ] Implement rich text editor for content
- [ ] Add image upload functionality
- [ ] Add pagination controls in UI
- [ ] Add search and filter UI components

---

## Notes

1. **Authentication**: Admin routes currently have no authentication. Add middleware before deploying.

2. **Slug Conflicts**: If two entries have the same title, slug generation will fail. Consider adding timestamp or random string to handle duplicates.

3. **Image Validation**: History has max 5 images. Blog has single featuredImage. Both expect Cloudinary URLs.

4. **Text Search**: Use the `search` query parameter to perform full-text search across indexed fields.

5. **Views Tracking**: Views increment only on public GET by ID/slug endpoints, not on admin access.

6. **Published Workflow**: Blogs have draft/published workflow. publishedAt is auto-set when published changes to true.

7. **Pagination**: Default limits are 10 for History, 12 for Blogs. Adjust as needed.

---

## Support

For issues or questions, contact the development team or create an issue in the repository.
