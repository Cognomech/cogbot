const fileUtils = require("./fileUtils.js");

module.exports.EventHandler = class EventHandler {
  constructor(listener, absEventDir) {
    this.absEventDir = absEventDir;
    this.eventRegistry = new Map();
    this.listener = listener;
  }

  async registerEventsFromDir(dir = this.absEventDir) {
    const files = await fileUtils.asyncRecursiveReaddir(dir);
    files.forEach((file) => {
      const event = require(file);
      const eventName = file.replace(/.*\\|\..*$/g, "");
      this.listener.on(eventName, event.bind(null, this.listener));
    });
  }
};
