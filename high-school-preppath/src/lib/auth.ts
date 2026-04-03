import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function comparePassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export async function signToken(payload: Record<string, string>) { return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(secret); }
export async function verifyToken(token: string) { return (await jwtVerify(token, secret)).payload; }
