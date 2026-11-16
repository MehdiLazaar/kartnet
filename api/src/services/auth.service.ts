import { compare, hash } from 'bcryptjs';

import { AppError } from '../lib/app-error.js';
import { signToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

const BCRYPT_ROUNDS = 10;

// Hash factice : quand l'email n'existe pas, on compare quand même un mot de passe,
// pour que la réponse prenne le même temps. Sinon on pourrait deviner quels emails ont un compte.
const dummyHash = hash('kartnet-timing-protection', BCRYPT_ROUNDS);

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('Un compte existe déjà avec cet email');
  }

  const user = await prisma.user.create({
    data: { email: input.email, passwordHash: await hash(input.password, BCRYPT_ROUNDS) },
  });

  return { token: signToken({ sub: user.id, email: user.email }), user };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    omit: { passwordHash: false }, // on a besoin du hash ici, exceptionnellement
  });

  const passwordOk = await compare(input.password, user?.passwordHash ?? (await dummyHash));
  if (!user || !passwordOk) {
    // Même message dans les deux cas : on ne révèle pas si l'email existe.
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { token: signToken({ sub: user.id, email: user.email }), user: safeUser };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.unauthorized('Ce compte n\'existe plus');
  }
  return user;
}
