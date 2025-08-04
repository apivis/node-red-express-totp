# Secure Node-RED with Express.js and TOTP Authentication

This project provides a secure, deployable Node-RED instance with a custom login flow using an Express.js frontend and Two-Factor Authentication (TOTP).

## What is Node-RED?

Node-RED is a programming tool for wiring together hardware devices, APIs, and online services in new and interesting ways. It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime in a single click.

## Security Setup

This setup enhances the security of Node-RED by:

- **Embedding Node-RED in an Express.js application:** This allows for a custom authentication layer in front of the Node-RED editor.
- **Password and TOTP Authentication:** The login process requires both a password and a Time-based One-Time Password (TOTP) from an authenticator app.
- **Secure Session Management:** Express-session is used to manage user login sessions.
- **2FA Setup:** You can set up or re-sync your authenticator app at any time by visiting the `/setup-2fa` page.

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nodered-totp-secure.git
    cd nodered-totp-secure
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set environment variables:**
    Create a `.env` file in the root of the project and add the following:
    ```
    ADMIN_PASSWORD=your_strong_password
    SESSION_SECRET=a_very_secret_key
    ```

4.  **Start the application:**
    ```bash
    npm start
    ```

5.  **Access the application:**
    -   Login page: `http://localhost:8000/login`
    -   Node-RED editor: `http://localhost:8000/red`
-   2FA setup: `http://localhost:8000/setup-2fa`

## Deployment

### Render

This project is configured for deployment on Render using the `render.yaml` file.

1.  Create a new "Blueprint Instance" on Render.
2.  Connect your GitHub repository.
3.  Render will automatically detect the `render.yaml` file and configure the service.
4.  The environment variables (`ADMIN_PASSWORD`, `SESSION_SECRET`, `TOTP_SECRET`) will be generated automatically. You can view and manage them in the Render dashboard.

**Important Note on TOTP:**
On the first deployment, a `TOTP_SECRET` will be generated and stored as an environment variable. You will need to use this secret to set up your authenticator app. You can set up or re-sync your authenticator app at any time by visiting the `/setup-2fa` page.

### Google App Engine

This project is configured for deployment on the Google App Engine Flexible Environment using the `app.yaml` file.

1.  **Install the Google Cloud SDK:**
    Follow the instructions at [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install).

2.  **Set environment variables:**
    It's recommended to set the environment variables in the Google Cloud Console for better security.

3.  **Deploy the application:**
    ```bash
    gcloud app deploy
    ```

### Koyeb

This project can be deployed on Koyeb using the provided `koyeb.yaml` file.

1.  **Install the Koyeb CLI:**
    Follow the instructions at [https://www.koyeb.com/docs/cli](https://www.koyeb.com/docs/cli).

2.  **Create Koyeb secrets:**
    ```bash
    koyeb secrets create your-admin-password -v "your_strong_password"
    koyeb secrets create your-session-secret -v "a_very_secret_key"
    koyeb secrets create your-totp-secret -v "your_totp_secret"
    ```

3.  **Deploy the application:**
    ```bash
    koyeb service deploy -f koyeb.yaml
    ```

    You will need to replace `your-docker-hub-username/nodered-secure:latest` in `koyeb.yaml` with the actual path to your Docker image.
