export function getOrCreateAnonymousId() {
  const key = "aca_anonymous_id";

  let anonymousId = localStorage.getItem(key);

  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem(key, anonymousId);
  }

  return anonymousId;
}

export function getOrCreateSessionId() {
  const key = "aca_session_id";

  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}