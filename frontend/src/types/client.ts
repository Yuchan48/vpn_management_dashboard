export interface Client {
  id: number;
  name: string;
  public_key: string;
  ip_address: string;
  user_id: number;
}

export interface ClientWithUser extends Client {
  username: string;
  is_demo: number;
}

export interface ClientStatus {
  clientId: number;
  name: string;
  publicKey?: string;
  allowedIPs?: string;
  endpoint?: string;
  status: "Online" | "Offline" | "Not Configured";
  userId: number;
  username: string;
}
