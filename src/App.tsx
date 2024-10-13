// src/App.tsx
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  FaExclamationCircle,
  FaFan,
  FaFire,
  FaMinus,
  FaPlus,
  FaRegLightbulb,
  FaSnowflake,
  FaTv,
} from "react-icons/fa";
import StateButton from "./components/ui/state-button";
import { ChevronLeft, ChevronRight, Sun } from "lucide-react";

// autoConnect off to prevent immediate connection (it was causing a bug withing the useEffect event listeners)
const socket = io("http://localhost:3000", {
  autoConnect: false,
});

interface DeviceStates {
  livingRoom: {
    lights: string;
    tv: { state: string; channel: number };
    airConditioning: { state: string; temperature: number };
  };
  kitchen: {
    lights: string;
    fridge: { temperature: number; alert: boolean };
    stove: { state: string; power: number };
  };
  room: {
    lights: string;
    fan: { state: string; speed: number };
    curtains: string;
  };
}

const App: React.FC = () => {
  const [deviceStates, setDeviceStates] = useState<DeviceStates | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    console.log("Status:", isConnected);
    console.log("Device states:", deviceStates);
    if (!isConnected) {
      console.log("Trying to connect...");
      socket.connect();
    }

    // Listen for socket connection
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);

      socket.emit("getInitialState");
    });

    // Handle initial state from server
    socket.on("initialState", (state: DeviceStates) => {
      console.log("Received initial state:", state);
      setDeviceStates(state);
    });

    socket.on("stateChanged", ({ room, device, state }) => {
      console.log(room, device, state);
      setDeviceStates((prevState: any) => ({
        ...prevState,
        [room]: {
          ...prevState[room],
          [device]: state,
        },
      }));
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("initialState");
      socket.off("stateChanged");
      socket.off("disconnect");
    };
  }, []);

  const handleDeviceUpdate = (room: string, device: string, newState: any) => {
    socket.emit("updateDevice", { room, device, state: newState });
  };

  if (!isConnected)
    return (
      <div className="w-full h-screen grid justify-center text-4xl">
        Conectando ao servidor...
      </div>
    );
  if (!deviceStates)
    return (
      <div className="w-full h-screen grid justify-center text-4xl">
        Carregando...
      </div>
    );

  return (
    <div className="container mx-auto p-4 xl:p-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        Casa Inteligente - Controle Remoto
      </h1>

      <div className="flex gap-2 items-center border rounded-lg p-3 shadow-sm w-fit mb-5">
        <div className="flex gap-1 items-center">
          <div className="border rounded-full p-2 bg-red-500 w-4 h-4" />
          Desligado
        </div>
        <div className="flex gap-1 items-center">
          <div className="border rounded-full p-2 bg-green-500 w-4 h-4" />
          Ligado
        </div>
      </div>
      {/* Living Room */}
      <div className="mb-8 rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Sala de Estar</h2>
        <section className="grid gap-3">
          {/* Lights */}
          <StateButton
            state={deviceStates.livingRoom.lights === "on"}
            onClick={() =>
              handleDeviceUpdate(
                "livingRoom",
                "lights",
                deviceStates.livingRoom.lights === "on" ? "off" : "on"
              )
            }
            icon={<FaRegLightbulb className="h-7" />}
          >
            Luz
          </StateButton>
          {/* TV */}
          <StateButton
            state={deviceStates.livingRoom.tv.state === "on"}
            onClick={() =>
              handleDeviceUpdate("livingRoom", "tv", {
                ...deviceStates.livingRoom.tv,
                state: deviceStates.livingRoom.tv.state === "on" ? "off" : "on",
              })
            }
            icon={<FaTv className="h-7" />}
          >
            TV
          </StateButton>
          {deviceStates.livingRoom.tv.state === "on" && (
            <div className="last:mb-0 mb-2 flex items-center">
              <span className="mr-4">
                Canal: {deviceStates.livingRoom.tv.channel}
              </span>
              <button
                onClick={() =>
                  handleDeviceUpdate("livingRoom", "tv", {
                    ...deviceStates.livingRoom.tv,
                    channel: deviceStates.livingRoom.tv.channel - 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <ChevronLeft className="h-7" />
              </button>
              <button
                onClick={() =>
                  handleDeviceUpdate("livingRoom", "tv", {
                    ...deviceStates.livingRoom.tv,
                    channel: deviceStates.livingRoom.tv.channel + 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <ChevronRight className="h-7" />
              </button>
            </div>
          )}
          {/* Air Conditioning */}
          <StateButton
            state={deviceStates.livingRoom.airConditioning.state === "on"}
            onClick={() =>
              handleDeviceUpdate("livingRoom", "airConditioning", {
                ...deviceStates.livingRoom.airConditioning,
                state:
                  deviceStates.livingRoom.airConditioning.state === "on"
                    ? "off"
                    : "on",
              })
            }
            icon={<FaSnowflake className="h-7" />}
          >
            Ar condicionado
          </StateButton>
          {deviceStates.livingRoom.airConditioning.state === "on" && (
            <div className="last:mb-0 mb-2 flex items-center">
              <span className="mr-4">
                Temperatura:{" "}
                {deviceStates.livingRoom.airConditioning.temperature}
                °C
              </span>
              <button
                onClick={() =>
                  handleDeviceUpdate("livingRoom", "airConditioning", {
                    ...deviceStates.livingRoom.airConditioning,
                    temperature:
                      deviceStates.livingRoom.airConditioning.temperature + 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <FaPlus className="h-7" />
              </button>
              <button
                onClick={() =>
                  handleDeviceUpdate("livingRoom", "airConditioning", {
                    ...deviceStates.livingRoom.airConditioning,
                    temperature:
                      deviceStates.livingRoom.airConditioning.temperature - 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <FaMinus className="h-7" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Kitchen */}
      <div className="mb-8 rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Cozinha</h2>
        {/* Lights */}
        <section className="grid gap-3">
          {/* Fridge */}
          <div className="mb-4 flex justify-between items-center">
            <span className="flex items-center">
              Temperatura da Geladeira:{" "}
              {deviceStates.kitchen.fridge.temperature}
              °C
            </span>
            <span className="ml-4 text-red-500 flex items-center">
              {deviceStates.kitchen.fridge.alert && (
                <FaExclamationCircle className="h-6 w-6 mr-2" />
              )}
              {deviceStates.kitchen.fridge.alert ? "Alert: Too warm!" : ""}
            </span>
          </div>
          <StateButton
            state={deviceStates.kitchen.lights === "on"}
            onClick={() =>
              handleDeviceUpdate(
                "kitchen",
                "lights",
                deviceStates.kitchen.lights === "on" ? "off" : "on"
              )
            }
            icon={<FaRegLightbulb className="h-7" />}
          >
            Luz
          </StateButton>
          {/* Stove */}
          <StateButton
            state={deviceStates.kitchen.stove.state === "on"}
            onClick={() =>
              handleDeviceUpdate("kitchen", "stove", {
                ...deviceStates.kitchen.stove,
                state: deviceStates.kitchen.stove.state === "on" ? "off" : "on",
              })
            }
            icon={<FaFire className="h-7" />}
          >
            Forno
          </StateButton>
          {deviceStates.kitchen.stove.state === "on" && (
            <div className="last:mb-0 mb-2 flex items-center">
              <span className="mr-4">
                Potência: {deviceStates.kitchen.stove.power}
              </span>
              <button
                onClick={() =>
                  handleDeviceUpdate("kitchen", "stove", {
                    ...deviceStates.kitchen.stove,
                    power: deviceStates.kitchen.stove.power + 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <FaPlus className="h-7" />
              </button>
              <button
                onClick={() =>
                  handleDeviceUpdate("kitchen", "stove", {
                    ...deviceStates.kitchen.stove,
                    power: deviceStates.kitchen.stove.power - 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <FaMinus className="h-7" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Room */}
      <div className="mb-8 rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-4">Quarto</h2>
        <section className="grid gap-3">
          {/* Lights */}
          <StateButton
            state={deviceStates.room.lights === "on"}
            onClick={() =>
              handleDeviceUpdate(
                "room",
                "lights",
                deviceStates.room.lights === "on" ? "off" : "on"
              )
            }
            icon={<FaRegLightbulb className="h-7" />}
          >
            Luz
          </StateButton>
          {/* Fan */}
          <StateButton
            state={deviceStates.room.fan.state === "on"}
            onClick={() =>
              handleDeviceUpdate("room", "fan", {
                ...deviceStates.room.fan,
                state: deviceStates.room.fan.state === "on" ? "off" : "on",
              })
            }
            icon={<FaFan className="h-7" />}
          >
            Ventilador
          </StateButton>
          {deviceStates.room.fan.state === "on" && (
            <div className="last:mb-0 mb-2 flex items-center">
              <span className="mr-4">
                Velocidade: {deviceStates.room.fan.speed}
              </span>
              <button
                onClick={() =>
                  handleDeviceUpdate("room", "fan", {
                    ...deviceStates.room.fan,
                    speed: deviceStates.room.fan.speed + 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <FaPlus className="h-7" />
              </button>
              <button
                onClick={() =>
                  handleDeviceUpdate("room", "fan", {
                    ...deviceStates.room.fan,
                    speed: deviceStates.room.fan.speed - 1,
                  })
                }
                className="bg-gray-500 text-white px-2 py-1 rounded ml-2"
              >
                <FaMinus className="h-7" />
              </button>
            </div>
          )}
          {/* Curtains */}
          <StateButton
            state={deviceStates.room.curtains === "open"}
            onClick={() =>
              handleDeviceUpdate(
                "room",
                "curtains",
                deviceStates.room.curtains === "open" ? "closed" : "open"
              )
            }
            icon={<Sun className="h-7" />}
          >
            Cortinas
          </StateButton>
        </section>
      </div>
    </div>
  );
};

export default App;
