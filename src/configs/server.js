let _debug = "online";

export const getSeverAddress = () =>
  process.env.NODE_ENV === "production"
    ? "https://table.liveteach.io"
    : _debug === "local"
    ? "http://localhost:5000"
    : "https://table.liveteach.io";

export const setDebugMode = (debug) => {
  _debug = debug;

  if (process.env.NODE_ENV !== "production")
    console.info(`[DEBUG] Connecting to ${_debug} server...`);
};

export const getDebugMode = () => _debug;
