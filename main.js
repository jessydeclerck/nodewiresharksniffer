const { spawn } = require("child_process");
const oboe = require("oboe");
const _ = require("lodash");
const axios = require("axios");
const readMsgId = require("./payloadReader").readMsgId;
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
  "any",
  "-e",
  "tcp.srcport",
  "-e",
  "tcp.payload",
  "-o",
  "tcp.desegment_tcp_streams:true", //TODO try defragment
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
  if (payload) {
    let dataPayload = payload[0].replace(/:/g, "");
    let msgId = readMsgId(dataPayload);
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
