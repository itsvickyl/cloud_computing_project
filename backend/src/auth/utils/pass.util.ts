export function isPasswordStrong(pass: string): boolean {
  const passwordRegx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;
  return passwordRegx.test(pass);
}
