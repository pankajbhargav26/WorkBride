# WorkBridge

## Local setup

1. In `BackEnd`, copy `.env.example` to `.env` and set your MongoDB URI (using the `workbridge` database) and a private JWT secret.
2. In `FrontEnd/workbridge`, copy `.env.example` to `.env`. The API URL defaults to `http://localhost:5000/api`.
3. Start the backend with `npm run dev` from `BackEnd`.
4. Start the frontend with `npm run dev` from `FrontEnd/workbridge`.

The customer Post Job form requires a signed-in customer. It sends the backend JWT in the `Authorization: Bearer <token>` header. Jobs are created in the existing `jobs` collection, with the customer ID taken from that token.

To upload job photos, create a Cloudinary unsigned upload preset and set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in the frontend `.env`. Uploaded image URLs, not image data, are stored in the job document. Photo upload configuration is only required when attaching photos.

`GET /api/jobs/my` powers the customer My Jobs page. Technician routes are `GET /api/jobs/available`, `PATCH /api/jobs/:id/accept`, and `PATCH /api/jobs/:id/complete`.

For production, set `VITE_API_URL` to the deployed backend API base URL ending in `/api`, and configure the backend CORS origin to the deployed frontend URL. Restart Vite after changing `.env`.
