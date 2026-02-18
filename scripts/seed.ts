import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

type RequiredEnvVar =
  | "DATABASE_URL"
  | "SEED_ADMIN_EMAIL"
  | "SEED_ADMIN_NAME"
  | "SEED_ADMIN_PASSWORD";

function getRequiredEnv(name: RequiredEnvVar): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getOptionalEnv(name: "SEED_SCHOOL_NAME" | "SEED_DISTRICT_NAME", fallback: string): string {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

type SchoolRow = {
  id: string;
  name: string;
  district_name: string | null;
};

type UserRow = {
  id: string;
  email: string;
  school_id: string | null;
  role: string;
  is_active: boolean;
  name: string | null;
};

async function main() {
  const databaseUrl = getRequiredEnv("DATABASE_URL");
  const schoolName = getOptionalEnv("SEED_SCHOOL_NAME", "Oakestown Intermediate School");
  const districtName = getOptionalEnv("SEED_DISTRICT_NAME", "Grandville Public Schools");
  const adminEmail = getRequiredEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const adminName = getRequiredEnv("SEED_ADMIN_NAME");
  const adminPassword = getRequiredEnv("SEED_ADMIN_PASSWORD");

  if (!adminEmail.includes("@")) {
    throw new Error("SEED_ADMIN_EMAIL must be a valid email address.");
  }
  if (adminPassword.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("begin");

    const existingSchoolResult = await client.query<SchoolRow>(
      `
        select id::text as id, name, district_name
        from schools
        where lower(name) = lower($1)
        limit 1
      `,
      [schoolName]
    );

    let school: SchoolRow;
    if (existingSchoolResult.rows[0]) {
      school = existingSchoolResult.rows[0];
      console.log(`Reusing school: ${school.name} (${school.id})`);
    } else {
      const insertedSchoolResult = await client.query<SchoolRow>(
        `
          insert into schools (name, district_name, created_at, updated_at)
          values ($1, $2, now(), now())
          returning id::text as id, name, district_name
        `,
        [schoolName, districtName]
      );

      school = insertedSchoolResult.rows[0];
      console.log(`Created school: ${school.name} (${school.id})`);
    }

    const existingUserResult = await client.query<UserRow>(
      `
        select
          id::text as id,
          email,
          school_id::text as school_id,
          role::text as role,
          is_active,
          name
        from users
        where lower(email) = lower($1)
        limit 1
      `,
      [adminEmail]
    );

    if (existingUserResult.rows[0]) {
      const existingUser = existingUserResult.rows[0];
      console.log(`Admin user already exists: ${existingUser.email} (${existingUser.id})`);

      const shouldUpdate =
        existingUser.school_id !== school.id ||
        existingUser.role !== "admin" ||
        existingUser.is_active !== true ||
        existingUser.name !== adminName;

      if (shouldUpdate) {
        await client.query(
          `
            update users
            set
              school_id = $1,
              name = $2,
              role = 'admin',
              is_active = true,
              updated_at = now()
            where id = $3
          `,
          [school.id, adminName, existingUser.id]
        );
        console.log(`Updated existing admin user to match seed config: ${existingUser.email}`);
      }
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      const insertedUserResult = await client.query<UserRow>(
        `
          insert into users (
            school_id,
            email,
            name,
            role,
            password_hash,
            is_active,
            created_at,
            updated_at
          )
          values ($1, $2, $3, 'admin', $4, true, now(), now())
          returning
            id::text as id,
            email,
            school_id::text as school_id,
            role::text as role,
            is_active,
            name
        `,
        [school.id, adminEmail, adminName, passwordHash]
      );

      const createdUser = insertedUserResult.rows[0];
      console.log(`Created admin user: ${createdUser.email} (${createdUser.id})`);
    }

    await client.query("commit");
    console.log("Seed completed successfully.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
