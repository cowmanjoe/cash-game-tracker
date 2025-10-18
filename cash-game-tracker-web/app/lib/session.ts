import 'server-only'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.warn('Failed to verify session')

    return null;
  }
}

export async function createSession(accountId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ accountId, expiresAt })

  // Use SECURE_COOKIES env var to control cookie security, defaulting to true
  const secureCookies = process.env.SECURE_COOKIES !== 'false';

  console.log(`SECURE_COOKIES=${process.env.SECURE_COOKIES}, secureCookies=${secureCookies}`);
  console.log(session);

  cookies().set('session', session, {
    httpOnly: true,
    secure: secureCookies,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = cookies().get('session')?.value
  console.log(`retrieved session ${session}`);

  const payload = await decrypt(session)

  console.log(`retrieved payload=${JSON.stringify(payload)}`)

  if (!session || !payload) {
    return null
  }

  return payload;
}

export interface SessionPayload extends JWTPayload { 
  accountId: string;
}