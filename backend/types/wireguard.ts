export interface WireGuardPeer {
  publicKey: string;
  endpoint: string;
  allowedIPs: string;
  latestHandshake: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}
