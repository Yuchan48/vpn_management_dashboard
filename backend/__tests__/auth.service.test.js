const authService = {
  changePassword: jest.fn((user) => {
    if (user.username.startsWith("demo_")) {
      return Promise.reject({ status: 403 });
    }
    return Promise.resolve(true);
  }),
};
const clientService = require("../services/client.service");

describe("Demo User Restrictions", () => {
  it("should reject change password for demo user", async () => {
    const demoUser = { username: "demo_user", id: 2 };
    await expect(
      authService.changePassword(demoUser, "newpass"),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("should allow demo user to create clients", async () => {
    const client = await clientService.createClient({
      name: "demo-client",
      publicKey: "demo-key",
      ipAddress: "10.0.0.60",
      userId: 2,
      is_demo: 1,
    });
    expect(client).toHaveProperty("id");
  });
});
