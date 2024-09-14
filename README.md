# DocAI Backend

This is the backend for the DocAI application, which provides API endpoints for user authentication, document processing, and AI integration. The backend is built using Node.js, Express, and MongoDB.

## Features

- User Authentication using Firebase Admin SDK.
- API endpoints to upload, extract, and manage documents.
- Integration with AI services (OpenAI, Claude AI) for processing document content.
- Secure data handling, ensuring that users can only access their documents.

## Getting Started

### Prerequisites

- Node.js and npm installed on your local machine.
- MongoDB instance (local or cloud).
- Firebase Admin SDK service account JSON file.
- OpenAI and Claude AI API keys if you plan to use these services.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Jitesh17/DocAI-backend.git
    cd DocAI-backend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with your environment variables:
    ```bash
    PORT=5000
    MONGO_URI=your-mongodb-connection-string
    OPENAI_API_KEY=your-openai-api-key
    CLAUDE_API_KEY=your-claude-api-key
    FIREBASE_SERVICE_ACCOUNT_KEY=./path-to-your/serviceAccountKey.json
    ```

4. Place the `serviceAccountKey.json` file in the specified path. This file is required for Firebase Admin SDK to verify user tokens.

### Running the Server

```bash
node index.js
```

## Usage

- **Upload Documents:** Use the `/api/read-document` endpoint to upload and extract content from documents. The extracted content is stored in the MongoDB database, associated with the authenticated user.
- **Manage Documents:** Use the `/api/uploaded-documents` endpoint to fetch documents uploaded by the current user, and `/api/delete-documents` to delete specific documents.
- **AI Processing:** Use the `/api/send-to-ai` endpoint to send prompts and document contents to the integrated AI services (OpenAI or Claude AI) for processing.
- **Authentication:** All endpoints are protected using Firebase Authentication. Users must be signed in to interact with the endpoints.

### API Endpoints

- `POST /api/read-document`: Uploads and extracts content from documents.
- `GET /api/uploaded-documents`: Fetches the list of documents uploaded by the current user.
- `DELETE /api/delete-documents`: Deletes specified documents belonging to the current user.
- `POST /api/send-to-ai`: Sends a prompt and document content to AI services for processing.

## Deployment

This project is set up to deploy automatically on Render. Follow these steps for manual deployment:

1. **Push to GitHub:** Ensure all changes are committed and pushed to your GitHub repository.
2. **Connect to Render:** Link your GitHub repository to Render and trigger a deploy.
3. **Set Environment Variables:** In Render's dashboard, set up all necessary environment variables, including:
   - `PORT`
   - `MONGO_URI`
   - `OPENAI_API_KEY`
   - `CLAUDE_API_KEY`
4. **Manage Secret Files:** Upload the `serviceAccountKey.json` file through Render's Secrets management feature to securely store Firebase credentials. Access the file in your code using `/etc/secrets/serviceAccountKey.json`.

## License

This project is licensed under the [Creative Commons Non-Commercial License](https://creativecommons.org/licenses/by-nc/4.0/). You are free to use, modify, and distribute the code for non-commercial purposes, provided that you give appropriate credit.

## Acknowledgements

- **Node.js & Express:** For creating a robust backend server.
- **MongoDB:** For managing and storing document data.
- **Firebase Admin SDK:** For secure user authentication and token verification.
- **OpenAI & Claude AI APIs:** For AI processing and generating responses.
