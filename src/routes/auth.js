import express from "express";

const router = express.Router();

// ----------------------------------------------------
// 1. OpenID Connect & OAuth 2.0 Endpoints
// ----------------------------------------------------
router.get("/.well-known/openid-configuration", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.json({
    issuer: `${baseUrl}`,
    authorization_endpoint: `${baseUrl}/oauth/v2/authorize`,
    token_endpoint: `${baseUrl}/oauth/v2/token`,
    userinfo_endpoint: `${baseUrl}/oauth/v2/userinfo`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    revocation_endpoint: `${baseUrl}/oauth/v2/revoke`,
    introspection_endpoint: `${baseUrl}/oauth/v2/introspect`,
    response_types_supported: ["code", "token", "id_token", "code token", "code id_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "profile", "email", "offline_access"]
  });
});

router.get("/.well-known/jwks.json", (req, res) => {
  res.json({
    keys: [
      {
        kty: "RSA",
        use: "sig",
        alg: "RS256",
        kid: "dummy-key-2026-09",
        n: "u1R5Z8...dummy_modulus_string...AQAB",
        e: "AQAB"
      }
    ]
  });
});

router.get("/oauth/v2/authorize", (req, res) => {
  const { redirect_uri, state, response_type = "code" } = req.query;
  const mockCode = `auth_code_${Math.random().toString(36).substring(2, 10)}`;

  // If redirect_uri is specified, simulate OAuth redirect flow, otherwise return JSON
  if (redirect_uri && !req.query.json) {
    const separator = redirect_uri.includes("?") ? "&" : "?";
    return res.redirect(`${redirect_uri}${separator}code=${mockCode}&state=${state || ""}`);
  }

  res.json({
    message: "Authorization endpoint hit",
    code: mockCode,
    state: state || null,
    redirectUrl: redirect_uri ? `${redirect_uri}?code=${mockCode}&state=${state || ""}` : null
  });
});

router.post("/oauth/v2/token", (req, res) => {
  const { grant_type = "authorization_code", code, refresh_token } = req.body || {};
  res.json({
    access_token: `dummy_access_token_${Math.random().toString(36).substring(2, 15)}`,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: `dummy_refresh_token_${Math.random().toString(36).substring(2, 15)}`,
    scope: "openid profile email",
    id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR1bW15LWtleS0yMDI2LTA5In0.eyJzdWIiOiJ1c3JfMSIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NjA4MCIsImF1ZCI6ImNsaWVudF8xMjMiLCJleHAiOjE3OTA4NTQ0MDB9.dummy_signature"
  });
});

router.get("/oauth/v2/userinfo", (req, res) => {
  res.json({
    sub: "usr_1",
    name: "Alice Tanaka",
    given_name: "Alice",
    family_name: "Tanaka",
    email: "alice@example.com",
    email_verified: true,
    picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  });
});

router.post("/oauth/v2/revoke", (req, res) => {
  res.status(200).json({ status: "success", message: "Token revoked" });
});

router.post("/oauth/v2/introspect", (req, res) => {
  const { token } = req.body || {};
  res.json({
    active: true,
    scope: "openid profile email",
    client_id: "client_dummy_app",
    sub: "usr_1",
    exp: Math.floor(Date.now() / 1000) + 3600
  });
});

// ----------------------------------------------------
// 2. WebAuthn / Passkeys
// ----------------------------------------------------
router.post("/api/webauthn/register/options", (req, res) => {
  res.json({
    challenge: Buffer.from(`challenge_${Date.now()}`).toString("base64url"),
    rp: { name: "dummyAPI App", id: "localhost" },
    user: { id: "dXNyXzE=", name: "alice@example.com", displayName: "Alice Tanaka" },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
    authenticatorSelection: { userVerification: "preferred", residentKey: "required" },
    timeout: 60000
  });
});

router.post("/api/webauthn/register/verify", (req, res) => {
  res.json({ verified: true, credentialId: `cred_${Date.now()}`, message: "Passkey registered successfully" });
});

router.post("/api/webauthn/login/options", (req, res) => {
  res.json({
    challenge: Buffer.from(`login_challenge_${Date.now()}`).toString("base64url"),
    timeout: 60000,
    rpId: "localhost",
    userVerification: "preferred"
  });
});

router.post("/api/webauthn/login/verify", (req, res) => {
  res.json({
    verified: true,
    user: { id: "usr_1", email: "alice@example.com" },
    token: `dummy_webauthn_session_${Date.now()}`
  });
});

// ----------------------------------------------------
// 3. SCIM 2.0 (Identity Provisioning)
// ----------------------------------------------------
router.get("/scim/v2/Users", (req, res) => {
  res.json({
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    totalResults: 1,
    startIndex: 1,
    itemsPerPage: 10,
    Resources: [
      {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        id: "usr_1",
        userName: "alice@example.com",
        name: { formatted: "Alice Tanaka", familyName: "Tanaka", givenName: "Alice" },
        active: true,
        emails: [{ value: "alice@example.com", primary: true }]
      }
    ]
  });
});

router.post("/scim/v2/Users", (req, res) => {
  res.status(201).json({
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    id: `usr_${Date.now()}`,
    userName: req.body.userName || "newuser@example.com",
    active: true,
    meta: { resourceType: "User", created: new Date().toISOString() }
  });
});

// ----------------------------------------------------
// 4. BaaS Compatibility (Firebase / Supabase style)
// ----------------------------------------------------
router.post("/identitytoolkit/v3/relyingparty/verifyPassword", (req, res) => {
  res.json({
    kind: "identitytoolkit#VerifyPasswordResponse",
    localId: "usr_firebase_123",
    email: req.body.email || "user@firebase.com",
    displayName: "Firebase Test User",
    idToken: `dummy_firebase_id_token_${Date.now()}`,
    registered: true,
    refreshToken: "dummy_firebase_refresh_token",
    expiresIn: "3600"
  });
});

router.post("/auth/v1/signup", (req, res) => {
  res.status(200).json({
    id: `usr_supa_${Date.now()}`,
    aud: "authenticated",
    role: "authenticated",
    email: req.body.email || "user@supabase.io",
    created_at: new Date().toISOString(),
    session: {
      access_token: `sb_access_${Date.now()}`,
      token_type: "bearer",
      user: { id: "usr_supa_1", email: req.body.email || "user@supabase.io" }
    }
  });
});

export default router;
