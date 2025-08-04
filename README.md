# Secure Node-RED with Express.js and TOTP Authentication

This project provides a secure, deployable Node-RED instance with a custom login flow using an Express.js frontend and Two-Factor Authentication (TOTP).

## What is Node-RED?

Node-RED is a programming tool for wiring together hardware devices, APIs, and online services in new and interesting ways. It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime in a single click.

## Security Setup

This setup provides a robust security layer for your Node-RED instance. Here's a breakdown of the security measures in place:

- **Two-Factor Authentication (2FA) with TOTP:** This is the most significant security enhancement. By requiring a time-based one-time password from your authenticator app, we've added a second layer of security beyond just a password. This makes it much more difficult for an unauthorized user to gain access, even if they manage to steal your password.

- **Password Hashing with `bcrypt`:** We are using `bcrypt` to securely hash the admin password. This means that the actual password is never stored in the application or its environment variables. Instead, we store a cryptographic hash of the password. When you log in, the password you provide is hashed and then compared to the stored hash. This prevents anyone from being able to read the password, even if they gain access to the server.

- **Secure Session Management:** We are using `express-session` to manage user login sessions. This library implements secure session management practices, such as using signed cookies to prevent session hijacking.

- **Protection of Node-RED Routes:** The Node-RED editor and API are protected by the Express authentication middleware. This ensures that no one can access the Node-RED editor or its APIs without first authenticating through the Express login page.

- **Disabled Node-RED Admin Auth:** By disabling Node-RED's built-in authentication, we have a single, centralized authentication system. This reduces the complexity of the security setup and makes it easier to manage.

### Further Security Considerations

While this setup is quite secure, there are always further steps you can take to enhance security:

- **Use a Strong, Unique Password:** The security of the entire system still relies on the strength of your admin password. Make sure to use a long, complex, and unique password.

- **Securely Manage Environment Variables:** On platforms like Render, environment variables are stored securely. However, you should always be mindful of who has access to your Render account.

- **Implement Rate Limiting:** To protect against brute-force attacks, you could implement rate limiting on the login route. This would prevent an attacker from being able to make a large number of login attempts in a short period of time. Libraries like `express-rate-limit` can be used for this.

- **Enable HTTPS:** While Render automatically provides HTTPS for your application, if you were to deploy this on a different platform, you would need to ensure that HTTPS is enabled to encrypt the traffic between the user's browser and the server.

- **Regularly Update Dependencies:** It's important to keep your application's dependencies up to date to protect against any security vulnerabilities that may be discovered in them. You can use tools like `npm audit` to check for vulnerabilities.

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

You can deploy this project on Koyeb using either the CLI or the web dashboard.

#### Deploying with the Koyeb Dashboard

1.  **Create a new App on the Koyeb dashboard.**
2.  **Choose "GitHub" as the deployment method.**
3.  **Select your repository.**
4.  **Configure the Service:**
    *   **Service type:** `Web Service`
    *   **Docker image:** Leave this blank if you are deploying from a Git repository. Koyeb will automatically build the Docker image from the `Dockerfile` in your repository.
    *   **Ports:** Set the port to `8000`.
    *   **Environment variables:**
        *   `ADMIN_PASSWORD`: Your desired admin password.
        *   `SESSION_SECRET`: A long, random string for session management.
        *   `TOTP_SECRET`: A valid Base32 string for the TOTP secret. You can use the following value: `GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ`
5.  **Click "Deploy".**

#### Deploying with the Koyeb CLI

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

    You will need to replace `your-docker-hub-username/nodered-secure:latest` in `koyeb.yaml` with the actual path to your Docker image if you are not deploying from a Git repository.
