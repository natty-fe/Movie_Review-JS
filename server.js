const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const DATA_FILE = './data.json';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function readReviews() {
  try {
    const fileData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(fileData || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync(DATA_FILE, '[]');
      return [];
    }

    throw error;
  }
}

function saveReviews(reviews) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reviews, null, 2));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function getNextId(reviews) {
  if (reviews.length === 0) {
    return 1;
  }

  return Math.max(...reviews.map((review) => review.id)) + 1;
}

function validateReview(review, isUpdate = false) {
  const errors = [];

  if (!isUpdate || review.title !== undefined) {
    if (typeof review.title !== 'string' || review.title.trim() === '') {
      errors.push('title is required and must be a non-empty string');
    }
  }

  if (!isUpdate || review.director !== undefined) {
    if (typeof review.director !== 'string' || review.director.trim() === '') {
      errors.push('director is required and must be a non-empty string');
    }
  }

  if (!isUpdate || review.genre !== undefined) {
    if (typeof review.genre !== 'string' || review.genre.trim() === '') {
      errors.push('genre is required and must be a non-empty string');
    }
  }

  if (!isUpdate || review.releaseYear !== undefined) {
    if (!Number.isInteger(review.releaseYear) || review.releaseYear < 1888) {
      errors.push('releaseYear is required and must be a valid year');
    }
  }

  if (!isUpdate || review.rating !== undefined) {
    if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
      errors.push('rating is required and must be a number from 1 to 5');
    }
  }

  if (!isUpdate || review.watched !== undefined) {
    if (typeof review.watched !== 'boolean') {
      errors.push('watched is required and must be true or false');
    }
  }

  if (!isUpdate || review.review !== undefined) {
    if (typeof review.review !== 'string' || review.review.trim() === '') {
      errors.push('review is required and must be a non-empty string');
    }
  }

  return errors;
}

function cleanReviewInput(input) {
  const cleanInput = {};

  if (input.title !== undefined) {
    cleanInput.title = typeof input.title === 'string' ? input.title.trim() : input.title;
  }

  if (input.director !== undefined) {
    cleanInput.director = typeof input.director === 'string' ? input.director.trim() : input.director;
  }

  if (input.genre !== undefined) {
    cleanInput.genre = typeof input.genre === 'string' ? input.genre.trim() : input.genre;
  }

  if (input.releaseYear !== undefined) {
    cleanInput.releaseYear = input.releaseYear;
  }

  if (input.rating !== undefined) {
    cleanInput.rating = input.rating;
  }

  if (input.watched !== undefined) {
    cleanInput.watched = input.watched;
  }

  if (input.review !== undefined) {
    cleanInput.review = typeof input.review === 'string' ? input.review.trim() : input.review;
  }

  return cleanInput;
}

function filterReviews(reviews, searchParams) {
  let filteredReviews = reviews;
  const title = searchParams.get('title');
  const director = searchParams.get('director');
  const genre = searchParams.get('genre');
  const rating = searchParams.get('rating');
  const watched = searchParams.get('watched');

  if (title) {
    filteredReviews = filteredReviews.filter((review) =>
      review.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  if (director) {
    filteredReviews = filteredReviews.filter((review) =>
      review.director.toLowerCase().includes(director.toLowerCase())
    );
  }

  if (genre) {
    filteredReviews = filteredReviews.filter((review) =>
      review.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  if (rating) {
    filteredReviews = filteredReviews.filter((review) => review.rating === Number(rating));
  }

  if (watched) {
    filteredReviews = filteredReviews.filter((review) => review.watched === (watched === 'true'));
  }

  return filteredReviews;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (pathParts[0] !== 'reviews') {
    sendJson(res, 404, { message: 'Route not found' });
    return;
  }

  const reviews = readReviews();
  const id = pathParts[1] ? Number(pathParts[1]) : null;

  if (pathParts.length > 2 || (pathParts[1] && !Number.isInteger(id))) {
    sendJson(res, 400, { message: 'Invalid review ID' });
    return;
  }

  if (req.method === 'GET' && pathParts.length === 1) {
    sendJson(res, 200, filterReviews(reviews, url.searchParams));
    return;
  }

  if (req.method === 'GET' && pathParts.length === 2) {
    const review = reviews.find((item) => item.id === id);

    if (!review) {
      sendJson(res, 404, { message: 'Review not found' });
      return;
    }

    sendJson(res, 200, review);
    return;
  }

  if (req.method === 'POST' && pathParts.length === 1) {
    const body = cleanReviewInput(await getRequestBody(req));
    const errors = validateReview(body);

    if (errors.length > 0) {
      sendJson(res, 400, { message: 'Validation failed', errors });
      return;
    }

    const now = new Date().toISOString();
    const newReview = {
      id: getNextId(reviews),
      ...body,
      createdAt: now,
      updatedAt: now
    };

    reviews.push(newReview);
    saveReviews(reviews);
    sendJson(res, 201, newReview);
    return;
  }

  if (req.method === 'PUT' && pathParts.length === 2) {
    const reviewIndex = reviews.findIndex((item) => item.id === id);

    if (reviewIndex === -1) {
      sendJson(res, 404, { message: 'Review not found' });
      return;
    }

    const body = cleanReviewInput(await getRequestBody(req));
    const errors = validateReview(body, true);

    if (errors.length > 0) {
      sendJson(res, 400, { message: 'Validation failed', errors });
      return;
    }

    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      ...body,
      id,
      updatedAt: new Date().toISOString()
    };

    saveReviews(reviews);
    sendJson(res, 200, reviews[reviewIndex]);
    return;
  }

  if (req.method === 'DELETE' && pathParts.length === 2) {
    const reviewIndex = reviews.findIndex((item) => item.id === id);

    if (reviewIndex === -1) {
      sendJson(res, 404, { message: 'Review not found' });
      return;
    }

    const deletedReview = reviews.splice(reviewIndex, 1)[0];
    saveReviews(reviews);
    sendJson(res, 200, {
      message: 'Review deleted successfully',
      deletedReview
    });
    return;
  }

  sendJson(res, 405, { message: 'Method not allowed for this route' });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    if (error.message === 'Invalid JSON body') {
      sendJson(res, 400, { message: error.message });
      return;
    }

    sendJson(res, 500, { message: 'Internal server error' });
  });
});

server.listen(PORT, () => {
  console.log(`Movie Review API is running on http://localhost:${PORT}`);
});
