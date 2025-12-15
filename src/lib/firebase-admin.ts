import * as admin from 'firebase-admin';

// Service account credentials embedded directly to avoid env var parsing issues on Windows
const serviceAccount = {
    projectId: "checkyourpaper-fe88c",
    clientEmail: "firebase-adminsdk-fbsvc@checkyourpaper-fe88c.iam.gserviceaccount.com",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCOq4t3O0b7Lki0
MKbY6LnFrofsAk43GzBjOqFhNad4KSSOZLf1refNr5z8O2Onl68iRm4vVh1cF06v
qmpCe1wv6VxNRjgjTRX7fC6OzwCH+2p88JYz0xzry6bKEPqW7ABNBcmwcipA8t5f
E6cwGOfRazD/+JYuuvTMcfIVOld1y3I4tF0mhbEGJlykhDVKKKl5bUQyO1kfp18i
mFALBX7DEIgRTY24gGSPw2pbmd8o7bRIL3/REy9v95cCx3rXf18+D0lWGWA48H9J
II0BFe4W3gEyEpYaHRFyHDeZPgTN5TdXVIuzrsxRs6yB5wyExJismmWx3ea2xMm8
sZe2mb01AgMBAAECggEABydGyOWp+3IopxBBbWLN3cGQgx7ieRTd6jvIV61vBjFZ
6eHW73SWyNNjVapMptyOJXPOloUE19c7VMeAqHCzAJv8yssYiXyV+5QQaYyrhCXx
Au61OUf+jTwa0srjJaoTockGgdhXkgYbbDz6BwlYpkFvpYX7UcCCAbY84x+Xvwov
Nmdmq9wl46l5MKQe6tCV7r//Db2/JFXGzzpBUtFDYNSO9sYqp94hj4d9gl/e6LLF
ePF90EZDrvEca+t5ebKR/WmYWQFKKUKc9E2cAw9QHFyPafi8i2qacRODdxAwjbKg
O2ornCsXpFRVZLWLPx6U2/8YvaXN60IQ/6rC5aLmAQKBgQDDrGNy5cT5oLK5vWXm
ByDOccByXHqIE5jofXTWf8UPcDVuIJJawZAm6niJtef/npf8QcnaE5kaw6t/6cP2
la/Reu/1dqmu67UNNLYxWGmr1549mxTCWXU56UCnY7ma23eUeOpNdHye1IjqSlRl
dyW4gS4Z2AtA5mtg9zIsBqVA9QKBgQC6p9jbCndZJP615ywONxJkgiY2gqSLtEMx
2n/UJK5sWx5tqed+h/BJC+QdvH3jPEwzc2QHw7QL2oL8X5rbk5vZLUNWyVbT2Wc2
VQijl5YKzZwFxMnmv/FlgTnxjAUlFixbMR7AAydJHOB1KhmW8+zImM6OewvdWy3q
5U1cYv/jQQKBgFQqrMRZbTbrFrWqcFBXtJbYey019kbeFyG6BS3W287eNz1dqVZ8
eCMlLCAgLODZOQr6yXaSg4Lts7Fbvj0s+emjdeAh4K8rGD/L8qqbGykdoCVjtbQ7
gp8cZAEcdlPUH0WwFSin+IrhZNtSiabzbzhD6K6ZLY4HDx0wd1ZUrXSZAoGBALAu
K9cceuhurei+ievk+XxbCHydNXkULfSJe+yervBh1UfHflUFNL2N9sRGnUB2MqrB
uOJHS9OAbfCOwRmOqyUDvzLUmhsecnhrLNtVAm+yARnE1Jn0BIM9xZaEBnsqAbYV
mCO/Fj7Bfe+5TCwakx4Idbcw11MZdC7qPun8G/HBAoGAF08gwonLryzyyF2RCEWm
Dzzgi3nWhLLNb+hQABdSNpDcFY/7RUT6uhCvTeaOcMpfUThM7vQTUrIzaS2F2VaG
fHgiC0XcIYByaTK0Oer2P/vQZ6JhouzVSFZoyJq591hdnzVW/HJZuUKNj3ibMZun
KiF0T/o0WNhG+0htp+rXnds=
-----END PRIVATE KEY-----
`
};

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
