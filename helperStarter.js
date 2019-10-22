const helper = require("./main");

let helperEventHandler = helper.helperEmitter;

helperEventHandler.on("helperStarted", data => {
  console.log("Helper started event detected");
  console.log(data);
});

helper.startHelper();

// test.stdout.on("error", error=>{
//     console.log("error recevied");
// })
// console.log(test);
