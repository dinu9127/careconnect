import bcrypt from "bcrypt";

const password = "Admin@123";

async function generateHash() {
  const hash = await bcrypt.hash(password, 10);
  console.log("Generated Hash:");
  console.log(hash);
}

generateHash();