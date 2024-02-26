import { WebSocketServer, createWebSocketStream, WebSocket } from 'ws';
import { addShips, addUserToRoom, attackShip, createGame, createPlayer, createRoom, deleteGame, isGameFinished, randomAttackShip, startGame, updateTurn, updateWinners, winners } from './data-handlers';
import { sendAttackFeedback, sendCreateGame, sendDataFromWS, sendFinishGame, sendStartGame, sendTurn, sendUpdatedWinners, sendUpdateRooms, updateSocketWithPlayerId } from './socket-controllers';
import { AddShipsPayload, AddUserToRoomPayload, Attack, COMMAND, CreatePlayerPayload, SHOT_RESULT, Socket } from './types';

export const sockets: Socket[] = []

export const initWsServer = () => {
    const WS_PORT = 3000
    const webSocketServer = new WebSocketServer({ port: WS_PORT }, () => console.log('Web Socket server started on the 3000 port!'));

    webSocketServer.on('connection', (ws: WebSocket, req) => {
        const socketId = sockets.length + 1
        sockets.push({ socket: ws, id: socketId })

        const wsStream = createWebSocketStream(ws, { encoding: 'utf8', decodeStrings: false })
        let currentPlayerId: number

        console.log((`WS_params:${JSON.stringify(req.socket.address())}`))

        wsStream.on('data', async (data: any) => {
            const request = JSON.parse(data)
            const command = request.type

            switch (command) {
                case COMMAND.reg: {
                    const payload = JSON.parse(request.data) as CreatePlayerPayload
                    const newPlayer = createPlayer(payload)

                    if (newPlayer) {
                        currentPlayerId = newPlayer.index
                        updateSocketWithPlayerId(socketId, currentPlayerId)


                        sendDataFromWS(ws, COMMAND.reg, {
                            name: newPlayer.name,
                            index: newPlayer.index,
                            error: false,
                            errorText: "",
                        })
                        sendUpdateRooms()
                        sendDataFromWS(ws, COMMAND.updateWinners, winners)
                    } else {
                        sendDataFromWS(ws, COMMAND.reg, {
                            name: payload.name,
                            index: 0,
                            error: true,
                            errorText: "You are already in game",
                        })
                    }
                    

                    break; 
                }

                case COMMAND.createRoom: {
                    if (currentPlayerId) {
                        createRoom(currentPlayerId)
                        sendUpdateRooms()
                    }
                    break;
                }

                case COMMAND.addUserToRoom: {
                    if (currentPlayerId) {
                        const players = addUserToRoom(currentPlayerId, JSON.parse(request.data) as AddUserToRoomPayload)

                        if (players) {
                            sendUpdateRooms()
                            const gameId = createGame(players)
                            sendCreateGame(gameId, players)
                        }


                    }
                    break;
                }

                case COMMAND.addShips: {
                    const payload = JSON.parse(request.data) as AddShipsPayload
                    const updatedGame = addShips(payload)

                    if (updatedGame.players.every((player)=> player.ships.length > 0)) {
                        startGame(updatedGame.idGame)
                        sendStartGame(updatedGame)
                        updateTurn(updatedGame.idGame)
                        sendTurn(updatedGame.idGame)
                        
                    }

                    break;
                }
                case COMMAND.randomAttack:
                case COMMAND.attack: {
                    const payload = JSON.parse(request.data) as Attack
                    const resultList = command === COMMAND.attack ? attackShip(payload) : randomAttackShip(payload)

                    if (resultList.length > 0) {
                        sendAttackFeedback(payload, resultList)

                        if (resultList.length === 1 && resultList[0].status === SHOT_RESULT.miss) {
                            updateTurn(payload.gameId)
                        }

                        sendTurn(payload.gameId)

                        if (isGameFinished(payload.indexPlayer, payload.gameId)) {
                            sendFinishGame(payload.indexPlayer, payload.gameId)
                            updateWinners(payload.indexPlayer)
                            sendUpdatedWinners()
                            deleteGame(payload.gameId)
                        }
                    }
                }
            }
        })

        wsStream.on('close', () => {
            wsStream.end()
        })
    })
}

