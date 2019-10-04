const { spawn } = require("child_process");
const oboe = require("oboe");
const _ = require("lodash");
const axios = require("axios");
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
  "4",
  "-e",
  "ip.src",
  "-e",
  "ip.dst",
  // "-e",
  //   "ip.id",
  //   "-e",
  //   "ip.flags",
  //   "-e",
  //   "ip.flags.rb",
  //   "-e",
  //   "ip.flags.df",
  //   "-e",
  //   "ip.flags.mf",
  //   "-e",
  //   "ip.frag_offset",
    "-e",
    "tcp.srcport",
    "-e",
    "tcp.dstport",
  //   "-e",
  //   "tcp.len",
  //   "-e",
  //   "tcp.seq",
  //   "-e",
  //   "tcp.nxtseq",
  "-e",
  "tcp.payload",
  //   "-e",
  //   "tcp.segment",
  "-o",
  "tcp.desegment_tcp_streams:false"
  // "host",
  // "54.154.81.32",
];
let tsharkProcess;

tsharkProcess = spawn("tshark", tsharkParams);

tsharkProcess.on("error", err => {
  console.error("error while starting tshark", err);
});

oboe(tsharkProcess.stdout).node("layers", data => {
  // if (!_.isEmpty(data)) {
  let ipsrc = data["ip.src"];
  let ipdst = data["ip.dst"];
  let payload = data["tcp.payload"];
  //TODO use port to determine is message is from client or from server
  console.log(`src ${ipsrc}`);
  console.log(`dst ${ipdst}`);
  console.log(`data ${payload}`);
  console.log("\n");
  // gameData = JSON.parse(data);
  // console.log(data.ip);
  // }
});

tsharkProcess.stderr.pipe(process.stdout);

tsharkProcess.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
