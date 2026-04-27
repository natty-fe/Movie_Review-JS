# Movie Review API

A simple REST API for managing movie reviews. Built with Node.js core modules only (`http` and `fs`) with no Express or other frameworks.

## Requirements

Node.js v14 or higher.

## How to Run

```bash
node server.js
```

The server runs on:

```text
http://localhost:3000
```

If PowerShell blocks `npm start`, run `node server.js` directly.

## Data

Records are stored in `data.json`. Each movie review has:

- `id` - unique identifier
- `title` - movie title
- `director` - movie director
- `genre` - movie genre
- `releaseYear` - year the movie was released
- `rating` - number from 1 to 5
- `watched` - `true` or `false`
- `review` - written review
- `createdAt` - timestamp for when the record was created
- `updatedAt` - timestamp for when the record was last updated

Example:

```json
{
  "id": 1,
  "title": "Inception",
  "director": "Christopher Nolan",
  "genre": "Science Fiction",
  "releaseYear": 2010,
  "rating": 5,
  "watched": true,
  "review": "A smart science fiction movie with memorable visuals.",
  "createdAt": "2026-04-26T12:00:00.000Z",
  "updatedAt": "2026-04-26T12:00:00.000Z"
}
```

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/reviews` | Get all movie reviews |
| GET | `/reviews/:id` | Get a single movie review |
| POST | `/reviews` | Create a new movie review |
| PUT | `/reviews/:id` | Update a movie review by ID |
| DELETE | `/reviews/:id` | Delete a movie review by ID |

## Filtering on GET /reviews

`GET /reviews` supports optional query parameters:

- `title` - case-insensitive substring match
- `director` - case-insensitive substring match
- `genre` - exact match, case-insensitive
- `rating` - exact rating match
- `watched` - `true` or `false`

Examples:

```http
GET /reviews?genre=Science%20Fiction
GET /reviews?title=inter
GET /reviews?director=nolan
GET /reviews?rating=5
GET /reviews?watched=true
GET /reviews?genre=Science%20Fiction&director=nolan
```

## Create Example

```http
POST /reviews
Content-Type: application/json
```

```json
{
  "title": "Dune",
  "director": "Denis Villeneuve",
  "genre": "Science Fiction",
  "releaseYear": 2021,
  "rating": 5,
  "watched": true,
  "review": "A visually impressive science fiction film."
}
```

## Update Example

`PUT /reviews/:id` supports partial updates. You only need to send the fields you want to change.

```http
PUT /reviews/1
Content-Type: application/json
```

```json
{
  "rating": 4,
  "review": "Still excellent after another viewing."
}
```

## Delete Example

```http
DELETE /reviews/1
```

## Notes

- Data is saved using the `fs` module.
- IDs are generated automatically.
- `createdAt` and `updatedAt` are generated automatically for new records.
- `updatedAt` changes every time a review is updated.
