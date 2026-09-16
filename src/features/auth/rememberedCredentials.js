const REMEMBERED_CONTACT_KEY = "banteay-remembered-contact";

export function getRememberedContact() {
  try {
    return localStorage.getItem(REMEMBERED_CONTACT_KEY) || "";
  } catch {
    return "";
  }
}

export async function getRememberedCredentials() {
  const contact = getRememberedContact();
  if (!contact || !navigator.credentials?.get || !window.PasswordCredential) {
    return { contact, password: "" };
  }

  try {
    const credential = await navigator.credentials.get({
      password: true,
      mediation: "optional",
    });

    if (credential instanceof window.PasswordCredential && credential.id === contact) {
      return { contact, password: credential.password || "" };
    }
  } catch {
    // The browser may decline silent credential access. The remembered contact
    // is still useful and its password manager can offer the saved password.
  }

  return { contact, password: "" };
}

export async function saveRememberedCredentials(contact, password) {
  try {
    localStorage.setItem(REMEMBERED_CONTACT_KEY, contact);
  } catch {
    // A privacy setting may block local storage. Password-manager storage can
    // still work, so continue without failing an otherwise valid sign-in.
  }

  if (!navigator.credentials?.store || !window.PasswordCredential) return;

  try {
    await navigator.credentials.store(new window.PasswordCredential({
      id: contact,
      name: contact,
      password,
    }));
  } catch {
    // Saving credentials is optional and may be declined by the user/browser.
  }
}

export function clearRememberedCredentials() {
  try {
    localStorage.removeItem(REMEMBERED_CONTACT_KEY);
  } catch {
    // Clearing an unavailable storage area requires no further action.
  }
}
