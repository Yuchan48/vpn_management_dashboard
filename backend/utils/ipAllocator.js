/*
IP Address Allocation Logic to assign unique VPN IPs for each client.

Example VPN subnet:
10.0.0.0/24

Server might be:
10.0.0.1

Clients:
10.0.0.2
10.0.0.3
10.0.0.4
...

It should:
- Find highest assigned IP
- Return next one

*/

function getNextAvailableIp(clients) {
  const baseIp = "10.0.0.";

  // Extract assigned IPs from clients and convert to integers for comparison
  const assignedIps = clients
    .map((client) => client.ip_address)
    .filter((ip) => ip !== null)
    .map((ip) => parseInt(ip.split(".")[3], 10)); // Extract the last octet and convert to integer.
  // returns an array of integers representing the last octet of assigned IPs, e.g., [2, 3, 4]

  let nextIpSuffix = 2; // Start from 2 since 1 is typically reserved for the server

  while (assignedIps.includes(nextIpSuffix)) {
    nextIpSuffix++;

    // If we exceed 254, it means we've run out of available IPs in the subnet
    if (nextIpSuffix > 254) {
      throw new Error("No available IP addresses in the subnet");
    }
  }

  // Return the next available IP address in the format "10.0.0.X"
  return `${baseIp}${nextIpSuffix}`;
}

module.exports = {
  getNextAvailableIp,
};
