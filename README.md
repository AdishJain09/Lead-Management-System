# Mini Lead Manager

A simple backend for managing sales leads, built with Node.js, Express, and MongoDB. Nothing fancy in terms of folder structure — everything's split by responsibility, but kept flat on purpose so it's easy to navigate without digging through nested folders.

## What's in here

| File | What it's for |
|------|----------------|
| `server.js` | The starting point — wires everything together and boots up the server |
| `db.js` | Handles the MongoDB connection |
| `leadModel.js` | The Mongoose schema — defines what a lead looks like, including its notes and history |
| `leadController.js` | Where the actual logic lives — creating leads, updating them, adding notes, etc. |
| `leadRoutes.js` | Connects incoming requests (URL + method) to the right controller function |

## A few things worth knowing

**No duplicate leads.** When someone hits `POST /api/leads`, the app first checks if that phone number already exists. If it does, instead of creating a second entry, it merges the new info into the existing lead and quietly logs what changed.

**Full history, always.** Every time something changes — a status update, an edited field, a merge from a duplicate — the app compares the old and new values and saves that diff into the lead's `history[]` array. Nothing gets overwritten without a trace.

**Notes can't be deleted or edited.** By design, there's only a POST route for notes. Once a note is added, it stays exactly as it was written — no editing, no deleting. Think of it as a permanent log.

## API Routes

| Method | Route | What it does |
|--------|-------|---------------|
| POST | `/api/leads` | Create a new lead (auto-merges if the phone number already exists) |
| GET | `/api/leads` | Get all leads — supports filtering with `?status=` and `?source=` |
| GET | `/api/leads/:id` | Get a single lead, including its full history and notes |
| PATCH | `/api/leads/:id/status` | Just update the status |
| PATCH | `/api/leads/:id` | Update name, email, or source |
| POST | `/api/leads/:id/notes` | Add a note to a lead |
| GET | `/api/leads/:id/notes` | Get all notes for a lead |

## Getting it running locally

```bash
npm install
cp .env   # drop your MongoDB URI in here
npm run dev
```

## Deploying it

1. Spin up a free cluster on **MongoDB Atlas**, allow access from `0.0.0.0/0`, and grab your connection string.
2. Push the repo to GitHub.
3. On **Render.com**: create a New Web Service, connect your repo, set the build command to `npm install` and the start command to `npm start`, add your `MONGO_URI` as an environment variable, and deploy.

That's it — pretty straightforward once it's set up.
