## load-balancer-active-install
This repository comes from the main project [/ZeitounCorp/load-balancer/servers/Load-Balancer](https://github.com/ZeitounCorp/load-balancer)

## Auto-Install script
- ```curl -o- https://raw.githubusercontent.com/ZeitounCorp/load-balancer/master/install_active.sh | bash```

## Post-install requirements
- ```cd ~/load-balancer-active-install```
- ```touch .authorized_servers.json .env .pool_of_servers.json```

### .authorized_servers.json
- Add an Array of servers that are allowed to access the API

### .env
- Must include an API_KEY=the_key_you_generated_to_secure_your_api, a PORT(else served over port 3000) and a SSECRET_KEY that is equal to the Secret field returned from the cmd: ```bbb-conf --secret```

### .pool_of_servers.json
- Add an Array of servers that you want to include in the load-balancer

### Get the 'freest' server from your pool of servers
- Make a ```GET``` request to the endpoint ```/launchable/lb/server_to_use```, => Should return an object:
``` json
{
    "most_viable_server": {
        "hostname": "http://server_name.ext",
        "cpuLoad": 0,
        "hdMem": 206256295936,
        "ip": "server_ip",
        "reachable": true
    },
    "reachable_and_viable": [
        {
            "hostname": "http://server_name.ext",
            "cpuLoad": 0,
            "hdMem": 206256295936,
            "ip": "server_ip",
            "reachable": true
        }
    ],
    "overCharged_servers": [],
    "not_reachable_or_viable": [
        {
            "hostname": "http://server_name.ext",
            "cpuLoad": "not-defined",
            "hdMem": "not-defined",
            "ip": "not-defined",
            "reachable": false
        }
    ]
}
```
- Field ```"overCharged_servers"``` will be populated with servers whose cpu is used at more than 60%
