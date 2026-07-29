export const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

export function isStrongPassword(password: string) {
  return passwordRegex.test(password);
}

export const passwordRequirementsMessage =
  "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.";
