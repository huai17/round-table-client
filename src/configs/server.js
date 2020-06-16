let _debug = "remote";

export const getSeverAddress = () => {
  return process.env.NODE_ENV === "production"
    ? "https://table.liveteach.io"
    : _debug === "local"
    ? "http://localhost:5000"
    : "https://table.liveteach.io";
};
