"use strict";

// IISNode starts CommonJS entry points reliably on Azure App Service Windows.
// The application remains ESM and is loaded without duplicating its startup.
import("./server.mjs").catch((error) => {
  console.error("GAMEINDEX_IIS_START_FAILED", error);
  process.exitCode = 1;
});
