import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "YourStrongPassword"');
  process.exit(1);
}

const rounds = Number(process.env.BCRYPT_ROUNDS ?? "12");

if (Number.isNaN(rounds) || rounds < 4) {
  console.error("BCRYPT_ROUNDS must be a number >= 4");
  process.exit(1);
}

const hash = await bcrypt.hash(password, rounds);
console.log(hash);
