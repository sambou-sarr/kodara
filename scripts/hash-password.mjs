// Usage : npm run admin:hash -- "mon-mot-de-passe"
// Colle la ligne obtenue dans .env (ou la valeur dans les variables d'environnement de ton hébergeur). Même format que src/modules/admin/admin.auth.ts.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Donne un mot de passe de 10 caractères minimum : npm run admin:hash -- "..."');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`ADMIN_PASSWORD_HASH="scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}"`);
