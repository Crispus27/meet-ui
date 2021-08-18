module.exports = {
  "env": {
    "browser": true,
    "es6": true,
  },
  "rules": {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
  }
}