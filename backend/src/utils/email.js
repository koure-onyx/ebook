// Email functionality disabled - using Google OAuth only

export async function sendOtpEmail(email, otp, name = '') {
  console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
  return { success: true, dev: true };
}

export async function sendPasswordResetEmail(email, token, name = '') {
  console.log(`[DEV MODE] Reset token for ${email}: ${token}`);
  return { success: true, dev: true };
}

export async function sendParentLinkEmail(email, childName, otp) {
  console.log(`[DEV MODE] Parent link OTP for ${email}: ${otp}`);
  return { success: true, dev: true };
}
