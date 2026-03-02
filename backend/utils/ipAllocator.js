/*
2. Add IP Address Allocation Logic
You need a way to assign unique VPN IPs.
Example VPN subnet:
10.0.0.0/24

Server might be:
10.0.0.1

Clients:
10.0.0.2
10.0.0.3
10.0.0.4
...

Create:
utils/ipAllocator.js

Function:
getNextAvailableIp()

It should:
- Query DB
- Find highest assigned IP
- Return next one

*/
