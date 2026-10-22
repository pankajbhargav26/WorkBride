# WorkBridge Job Management API

## Setup

Configure `MONGO_URI` and `JWT_SECRET` in the backend `.env` file. The login API must sign a JWT with `JWT_SECRET` and include the customer's MongoDB ID as either the `id` or `sub` claim. Send the resulting token as a Bearer token.

Base URL: `http://localhost:5000`

## Create a job

**POST** `/api/jobs`

Headers:

```text
Authorization: Bearer <customer-jwt>
Content-Type: application/json
```

Body:

```json
{
  "serviceCategory": "Electrical",
  "problemDescription": "A wall socket is not working",
  "address": "12 MG Road, Pune",
  "preferredDate": "2026-11-05T00:00:00.000Z",
  "preferredTime": "10:00 AM"
}
```

Expected success status: `201 Created`. `customerId` is taken from the authenticated user, and `charges` defaults to `200`.

## Get my jobs

**GET** `/api/jobs/my-jobs`

Headers:

```text
Authorization: Bearer <customer-jwt>
```

Expected success status: `200 OK`.

## Get a job

**GET** `/api/jobs/<job-id>`

Headers:

```text
Authorization: Bearer <customer-jwt>
```

Expected success status: `200 OK`. A job that does not exist or belongs to a different customer returns `404 Not Found`.

## Common errors

- `400 Bad Request`: missing/invalid fields, unsupported service category, invalid job ID.
- `401 Unauthorized`: missing, invalid, expired, or unknown-user token.
- `403 Forbidden`: authenticated user is not a customer.
- `404 Not Found`: job does not exist or is not owned by the authenticated customer.
