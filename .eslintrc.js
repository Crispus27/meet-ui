module.exports = {

  "env": {
    node: true,
  },
  "extends": ['plugin:vue/base'],
  "rules": {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
  }
}