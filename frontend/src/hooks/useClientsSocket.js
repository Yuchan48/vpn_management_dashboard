import { useEffect } from "react";
import socket from "../utils/socket";

const useClientsSocket = (setClients) => {
  useEffect(() => {
    //open socket connection
    socket.connect();

    // listen for client updates
    socket.on("clientsUpdated", (updatedClients) => {
      setClients(updatedClients);
    });

    //cleanup on unmount
    return () => {
      socket.off("clientsUpdated");
      socket.disconnect();
    };
  }, [setClients]);
};

export default useClientsSocket;
