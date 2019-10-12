const HEADER_OFFSET = 2;
module.exports = {
  readMsgId: function(payload) {
    let buffer = Buffer.from(payload, "hex");
    return getHeader(buffer) >> 2;
  },
  readDataLen: function(payload) {
    let buffer = Buffer.from(payload, "hex");
    let header = getHeader(buffer);
    let dataLenLen = this.getDataLenLen(header);
    console.log(`payload length: ${buffer.byteLength}`)
    return buffer.readUIntBE(HEADER_OFFSET, dataLenLen);
  },
  getHeaderFromPayload: function(payload){
    let buffer = Buffer.from(payload, "hex");
    return getHeader(buffer);
  },
  getDataLenLen: function(header){
    return header & 3;
  }
};

function getHeader(buffer){
  return buffer.readInt16BE(0);
}
