module.exports = (client, error) => {
  if (error.errno === "ECONNRESET") {
    console.log("\nConnection lost, attempting to re-establish...");
  }
};
