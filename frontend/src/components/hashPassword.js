const bcrypt = require("bcrypt");

async function hashPassword() {
  const password = "Admin@123"; // Your admin password

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(hashedPassword);
}

hashPassword();