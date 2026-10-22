# WorkBridge Job Management API

## Setup

Configure `MONGO_URI` and `JWT_SECRET` in the backend `.env` file. The customer login API must sign a JWT with the same `JWT_SECRET` and include the customer's MongoDB ID as either the `id` or `sub` claim. The frontend reads that token from `localStorage.token` or `localStorage.accessToken`. Send it as a Bearer token.

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
  "title": "Repair a wall socket",
  "problemDescription": "A wall socket is not working",
  "address": "12 MG Road, Pune",
  "preferredDate": "2026-11-05T00:00:00.000Z",
  "preferredTime": "10:00 AM",
  "urgency": "Flexible",
  "budget": 500,
  "customerName": "Customer Name",
  "phone": "9876543210"
}
```

Expected success status: `201 Created`. `customerId` is taken from the authenticated user, and `charges` defaults to `200`. Title, urgency, budget, customer name, and phone are optional API fields.

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
