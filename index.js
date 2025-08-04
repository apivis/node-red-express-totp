const http = require('http');
const express = require('express');
const session = require('express-session');
const RED = require('node-red');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bodyParser = require('body-parser');

// --- Basic App Setup ---
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// --- Session Configuration ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: 'auto' }
}));

// --- Node-RED Configuration ---
const settings = {
    httpAdminRoot: '/red',
    httpNodeRoot: '/api',
    userDir: './.nodered/',
    functionGlobalContext: {},
    editorTheme: {
        projects: {
            enabled: false
        }
    },
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            permissions: "*"
        }],
        authenticate: function(username, password) {
            return new Promise(function(resolve) {
                // This is a dummy authentication function.
                // The actual authentication is handled by the Express app.
                // We resolve with a dummy user to allow the Node-RED editor to load.
                if (username === "admin") {
                    resolve({ username: "admin", permissions: "*" });
                } else {
                    resolve(null);
                }
            });
        }
    }
};

// --- TOTP and Password Configuration ---
const adminPassword = process.env.ADMIN_PASSWORD || 'password';
let totpSecret = process.env.TOTP_SECRET;
let qrCodeUrl = '';

if (!totpSecret) {
    const secret = speakeasy.generateSecret({ length: 20 });
    totpSecret = secret.base32;
    process.env.TOTP_SECRET = totpSecret; // Store the secret for future use
}

const otpauth_url = speakeasy.otpauthURL({
    secret: totpSecret,
    label: 'Node-RED',
    issuer: 'Node-RED'
});

qrcode.toDataURL(otpauth_url, (err, data_url) => {
    if (err) {
        console.error('Error generating QR code:', err);
    } else {
        qrCodeUrl = data_url;
    }
});

// --- Middleware to Protect Node-RED Routes ---
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
}

app.use('/red', isAuthenticated);

// --- Routes ---
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { password, token } = req.body;

    console.log('Login attempt:');
    console.log('  - Password provided:', password ? 'Yes' : 'No');
    console.log('  - Token provided:', token);

    const isPasswordValid = await bcrypt.compare(password, await bcrypt.hash(adminPassword, 10));
    console.log('  - Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
        return res.render('login', { error: 'Invalid password or TOTP token.' });
    }

    console.log('  - Verifying TOTP with secret:', totpSecret);
    const verified = speakeasy.totp.verify({
        secret: totpSecret,
        encoding: 'base32',
        token: token,
        window: 1
    });
    console.log('  - TOTP verification result:', verified);

    if (verified) {
        req.session.isAuthenticated = true;
        return res.redirect('/red');
    } else {
        return res.render('login', { error: 'Invalid TOTP token.' });
    }
});

app.get('/setup-2fa', (req, res) => {
    res.render('setup-2fa', { qrCodeUrl: qrCodeUrl });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// --- Server Initialization ---
const server = http.createServer(app);
RED.init(server, settings);
app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(`Node-RED admin available at http://0.0.0.0:${PORT}${settings.httpAdminRoot}`);
    if (qrCodeUrl) {
        console.log(`Setup 2FA at http://0.0.0.0:${PORT}/setup-2fa`);
    }
});
