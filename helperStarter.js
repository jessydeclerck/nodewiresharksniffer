const helper = require("./main");

helper.startHelper();
setTimeout(() => {
  console.log("stopping helper");
  helper.stopHelper();
  setTimeout(() => {
    console.log("Restarting helper");
    helper.startHelper();
  }, 2000);
}, 3000);
