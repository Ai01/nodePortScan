const net = require("net");
const ProgressBar = require("progress");

/**
 * sacn port function
 *
 * @param {any} host
 * @param {any} start
 * @param {any} end
 */
function checkPorts(host, start, end) {
  return new Promise((resolve, reject) => {
    // ports need to scan
    let counts = end - start + 1;

    // save port which can connect
    let ports = [];

    // progress bar
    let bar = new ProgressBar("scanning [:bar] :precent :etas", {
      complete: "=",
      incomplete: " ",
      width: 50,
      total: counts
    });

    // circulation scan ports
    for (let i = start; i <= end; ++i) {
      // use net.connect
      let check = net.connect(
        {
          hsot: host,
          port: i
        },
        () => {
          // if connect success,save the port
          ports.push(i);
          // destroy
          check.destroy();
        }
      );

      // close
      check.on("close", () => {
        // check.destroy and connect fail both trigger the close event
        counts--;
        // progress
        bar.tick(1);
        // check finish
        if (counts === 0) {
          if (ports.length) {
            resolve(ports);
          }
          if (!ports.length) {
            reject("no port is opne");
          }
        }
      });

      // error
      check.on("error", err => {
        // console.error(err);
      });
    }
  });
}

module.exports = (host, start, end, callback) => {
  if (typeof end === "function" && callback === undefined) {
    callback = end;
    end = start;
  }

  checkPorts(host, start, end)
    .then(ports => {
      callback(ports);
    })
    .catch(err => {
      console.error(err);
    });
};
