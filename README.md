# Social API

A RESTful social media backend built with Node.js, Express, and PostgreSQL.

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcrypt password hashing

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create a PostgreSQL database and run the SQL in `schema.sql`
4. Copy `.env.example` to `.env` and fill in values
5. Run: `npm run dev`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login and get JWT token |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /posts | Create a post |
| GET | /posts/:id | Get a post |
| DELETE | /posts/:id | Delete your own post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /posts/:id/like | Like or unlike a post |
| GET | /posts/:id/likes | Get users who liked a post |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/:id | Get user profile |
| POST | /users/:id/follow | Follow or unfollow a user |

### Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /feed | Get paginated feed from followed users |

## Example Requests

### Register
''' POST /auth/register
{
"username": "john",
"email": "john@example.com",
"password": "secret123"
} '''
### Create Post (requires Bearer token)
''' POST /posts
Authorization: Bearer <token>
{
"content": "Hello world!"
} '''
### Get Feed with pagination
''' GET /feed?page=1&limit=10
Authorization: Bearer <token> '''
