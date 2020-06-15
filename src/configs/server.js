export default (options) =>
  process.env.NODE_ENV === "production"
    ? "https://table.liveteach.io"
    : options && options.debug === "local"
    ? "http://localhost:5000"
    : "https://table.liveteach.io";
