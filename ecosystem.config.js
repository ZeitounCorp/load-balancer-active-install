module.exports = {
  apps: [{
    name: "load_balancer",
    script: "./server_lb.js",
    watch: ["./.pool_of_servers.json", "./.authorized_servers.json", "./.env"],
    // Delay between restart
    autorestart: true,
    watch_delay: 100,
    ignore_watch: ["database"],
    watch_options: {
      "followSymlinks": false
    }
  }]
}
