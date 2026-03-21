const crypto = require("crypto");

const answers = {
  firstbeat: "EAST",
  clubs: "SILENCE",
  diamonds: "THE TRUTH IS HIDDEN",
  spades: "1999WAKE",
};

const hashes = {};
for (const [key, val] of Object.entries(answers)) {
  hashes[key] = crypto.createHash("sha256").update(val).digest("hex");
}

console.log(hashes);
