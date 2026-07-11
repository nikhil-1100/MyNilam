/**
 * Password Utilities (Argon2)
 * 
 * Argon2id is the winner of the Password Hashing Competition and is
 * recommended over bcrypt and scrypt for new systems.
 * 
 * Configuration:
 *   - memoryCost: 64MB — resistant to GPU cracking
 *   - timeCost: 3 iterations
 *   - parallelism: 1
 */
import argon2 from 'argon2'

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 1,
}

/**
 * Hash a plaintext password.
 * Returns a string that includes the salt (self-contained).
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS)
}

/**
 * Verify a plaintext password against a stored hash.
 * Returns true if the password matches.
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    // argon2.verify throws if the hash is malformed
    return false
  }
}

/**
 * Check if a stored hash needs to be rehashed
 * (e.g., if the algorithm parameters have changed)
 */
export async function needsRehash(hash: string): Promise<boolean> {
  return argon2.needsRehash(hash, ARGON2_OPTIONS)
}
