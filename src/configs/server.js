let _server = "https://table.liveteach.io";
let _debug = "remote";
let _local = "http://localhost:5000";
let _remote = "https://table.liveteach.io";

export const getSeverAddress = (options = {}) => {
  const {
    server = _server,
    debug = _debug,
    local = _local,
    remote = _remote,
  } = options;

  return process.env.NODE_ENV === "production"
    ? server
    : debug === "local"
    ? local
    : remote;
};
