module.exports = {
  readMsgId: function(payload) {
    let buffer = Buffer.from(payload, "hex");
    let header = buffer.readInt16BE(0);
    return header >> 2;
  }
};
