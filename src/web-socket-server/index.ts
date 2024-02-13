import { WebSocketServer, createWebSocketStream, WebSocket } from 'ws';
import { createRoomController, registerPlayerController, updateRoomsController } from './controllers';
import { COMMAND, CreatePlayerPayload, Player } from './types';

const sockets: WebSocket[] = []

export const initWsServer = () => {
    const WS_PORT = 3000
    const webSocketServer = new WebSocketServer({ port: WS_PORT }, () => console.log('Web Socket server started on the 3000 port!'));

    webSocketServer.on('connection', (ws: WebSocket, req) => {
        sockets.push(ws)
        const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false })
        let currentPlayerId: number

        console.log((`WS_params:${JSON.stringify(req.socket.address())}`))

        wsStream.on('data', async (data: any) => {
            const request = JSON.parse(data)
            const command = request.type

            switch (command) {
                case COMMAND.reg: {
                    const response = registerPlayerController(JSON.parse(request.data) as CreatePlayerPayload)
                    currentPlayerId = response.index

                    sendDataFromWS(ws, COMMAND.reg, response)
                    updateRooms()

                    break; 
                }
                case COMMAND.createRoom:
                    if (currentPlayerId) {
                        createRoomController(currentPlayerId)
                        updateRooms()
                    }
                    break;
            }
        })

        wsStream.on('close', () => {
            wsStream.end()
        })
    })
}

const sendDataFromWS = (ws: WebSocket, type: COMMAND, data: object)=> {
    ws.send(JSON.stringify({
        type,
        data: JSON.stringify(data),
        id: 0
    }))
}

const updateRooms = () => {
    sockets.forEach((socket) => sendDataFromWS(socket, COMMAND.updateRoom, updateRoomsController()))
}