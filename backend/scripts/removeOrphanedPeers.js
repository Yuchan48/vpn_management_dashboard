require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const { getAllClients } = require("../services/client.service");
const {
  getWireGuardPeers,
  removePeer,
} = require("../services/wireguard.service");

// Change process.env.WG_INTERFACE value to "utun4" in removePeer and getWireGuardPeers functions
// const WG_INTERFACE = process.env.WG_INTERFACE || "utun4";

async function removeOrphanedPeers() {
  try {
    const clients = await getAllClients();
    const peers = await getWireGuardPeers();

    await Promise.all(
      peers
        .filter(
          (peer) =>
            !clients.some((client) => client.public_key === peer.publicKey),
        )
        .map((peer) => {
          console.log(
            `Removing orphaned peer with public key: ${peer.publicKey}`,
          );
          return removePeer(peer.publicKey);
        }),
    );

    console.log("Orphaned peer cleanup complete.");
  } catch (error) {
    console.error("Error removing orphaned peers:", error);
  }
}

removeOrphanedPeers();
