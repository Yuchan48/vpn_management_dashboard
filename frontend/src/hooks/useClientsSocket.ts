import { useEffect, type Dispatch, type SetStateAction } from "react";
import socket from "../utils/socket";

import type { ClientStatus } from "../types/client";

const useClientsSocket = (
  setClients: Dispatch<SetStateAction<ClientStatus[]>>,
): void => {
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
