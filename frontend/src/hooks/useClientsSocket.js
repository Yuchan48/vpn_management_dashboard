import { useEffect } from "react";
import socket from "../utils/socket";

const useClientsSocket = (setClients) => {
  useEffect(() => {
    //open socket connection
    socket.connect();

    // listen for client updates
    socket.on("clientUpdate", (updatedClients) => {
      setClients(updatedClients);
    });

    //cleanup on unmount
    return () => {
      socket.off("clientUpdate");
      socket.disconnect();
    };
  }, [setClients]);
};

export default useClientsSocket;
