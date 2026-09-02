import { getNextAvailableIp } from "../../../utils/ipAllocator";
import type { Client } from "../../../types/client";

describe("getNextAvailableIp", () => {
  it("returns the first available IP address when there are no clients", () => {
    const clients: Client[] = [];

    expect(getNextAvailableIp(clients)).toBe("10.0.0.2");
  });

  it("returns the next available IP address", () => {
    const clients = [
      { ip_address: "10.0.0.2" },
      { ip_address: "10.0.0.3" },
      { ip_address: "10.0.0.4" },
    ] as Client[];

    expect(getNextAvailableIp(clients)).toBe("10.0.0.5");
  });

  it("returns a lower available IP when there is a gap", () => {
    const clients = [
      { ip_address: "10.0.0.2" },
      { ip_address: "10.0.0.4" },
    ] as Client[];

    expect(getNextAvailableIp(clients)).toBe("10.0.0.3");
  });

  it("ignores clients without an IP address", () => {
    const clients = [
      { ip_address: null },
      { ip_address: undefined },
      { ip_address: "10.0.0.2" },
    ] as Client[];

    expect(getNextAvailableIp(clients)).toBe("10.0.0.3");
  });

  it("starts allocating from IP address 10.0.0.2", () => {
    const clients = [{ ip_address: "10.0.0.1" }] as Client[];

    expect(getNextAvailableIp(clients)).toBe("10.0.0.2");
  });

  it("throws an error when all available IP addresses are used", () => {
    const clients = Array.from({ length: 253 }, (_, index) => ({
      ip_address: `10.0.0.${index + 2}`,
    })) as Client[];

    expect(() => getNextAvailableIp(clients)).toThrow(
      "No available IP addresses in the subnet",
    );
  });
});
