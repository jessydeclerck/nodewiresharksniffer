const { spawn } = require("child_process");
const oboe = require("oboe");
const _ = require("lodash");
const axios = require("axios");
const payloadReader = require("./payloadReader");
const msgIds = require("./neededMsg").msgIds;
const treasureHelper = require("./treasureHelper");
/**
 * on Linux, Unix, *BSD you can use

tshark -ni any

on Windows, any does not work, so you'll have to specify the interface ID or number

tshark -ni 1 -ni 2 -ni 3 (this will work on Linux, Unix, *BSD as well)

You can get the interface number with

dumpcap -D -M
 */
const tsharkParams = [
  "-T",
  "json",
  "-ni",
  "2",
  "-e",
  "tcp.srcport",
  "-e",
  "tcp.payload",
  "-o", //https://www.wireshark.org/docs/dfref/t/tcp.html see not captured flag tcp.analysis.lost_segment	
  // "ip.defragment:true",
  "tcp.desegment_tcp_streams:true", //promiscuous mode might help
  "port",
  "5555"
];
let tsharkProcess;
let tsharkBinName = "tshark";
if (process.platform === "win32") {
  tsharkBinName = "tshark.exe";
}

tsharkProcess = spawn("tshark", tsharkParams);

tsharkProcess.on("error", err => {
  console.error("error while starting tshark", err);
});

oboe(tsharkProcess.stdout).node("layers", async data => {
  let srcport = data["tcp.srcport"];
  let payload = data["tcp.payload"];
  const MSGID_DATALEN_SIZE = 2;
  const dataLenLen = payloadReader.getDataLenLen(payloadReader.getHeaderFromPayload(payload));
  const HEADER_SIZE = MSGID_DATALEN_SIZE + dataLenLen;
  let dataLen = payloadReader.readDataLen(payload);
  console.log(`dataLength: ${dataLen}`);
  console.log(`payload length without header length: ${Buffer.byteLength(payload) - HEADER_SIZE}`);
  if (payload) {
    let dataPayload = payload[0].replace(/:/g, "");
    let msgId = payloadReader.readMsgId(dataPayload);
    if (!msgIds.includes(msgId)) return;
    let context = getContext(srcport);
    let decodedMessage = await decodePayload(dataPayload, context);
    console.log(decodedMessage);
    treasureHelper.handleData(decodedMessage);
  }
});


tsharkProcess.stderr.pipe(process.stdout);

tsharkProcess.on("close", code => {
  console.log(`child process exited with code ${code}`);
});

function handleSplitMsg(){
  //TODO decode if total length without header is equal to some of messages length
}

async function decodePayload(payload, context) {
  let response;
  try {
    response = await axios.post(
      "https://webd2decoder.herokuapp.com/decoder/".concat(context),
      payload
    );
  } catch (err) {
    console.log(`error ${payload}`);
  }
  if (response) {
    return response.data;
  }
  return "";
}

function getContext(srcport) {
  let context = "fromclient";
  if (srcport == 5555) {
    context = "fromserver";
  }
  return context;
}
