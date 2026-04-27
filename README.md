# Movie Review API

A simple REST API built with Node.js core modules only:

- `http` for creating the server and handling routes
- `fs` for reading and writing review data

No Express or external frameworks are used.

## Run the Project

```bash
npm start
```

The server runs at:

```text
http://localhost:3000
```

## Data Model

Each movie review has this structure:

```json
{
  "id": 1,
  "title": "Inception",
  "director": "Christopher Nolan",
  "rating": 5,
  "review": "A smart science fiction movie with memorable visuals."
}
```

## Endpoints

### Get all reviews

```http
GET /reviews
```

### Get one review

```http
GET /reviews/1
```

### Create a review

```http
POST /reviews
Content-Type: application/json
```

```json
{
  "title": "Interstellar",
  "director": "Christopher Nolan",
  "rating": 5,
  "review": "A moving space drama with strong performances."
}
```

### Update a review

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

### Delete a review

```http
DELETE /reviews/1
```

## Notes

- Data is stored in `data.json`.
- IDs are generated automatically.
- Ratings must be numbers from 1 to 5.
