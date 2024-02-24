import { WebSocketServer, createWebSocketStream, WebSocket } from 'ws';
import { addShipsController, addUserController, attackShipController, createGameController, createRoomController, registerPlayerController, startGameController, updateRoomsController } from './controllers';
import { getEnemyId, getGame, updateTurn } from './data-handlers';
import { Battleship } from './game';
import { AddShipsPayload, AddUserToRoomPayload, Attack, AttackResult, COMMAND, CreatePlayerPayload, Game, SHOT_RESULT, Socket } from './types';

const sockets: Socket[] = []

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
                    const response = registerPlayerController(JSON.parse(request.data) as CreatePlayerPayload)
                    currentPlayerId = response.index
                    updateSocketWithPlayerId(socketId, currentPlayerId)
                    

                    sendDataFromWS(ws, COMMAND.reg, response)
                    updateRooms()

                    break; 
                }

                case COMMAND.createRoom: {
                    if (currentPlayerId) {
                        createRoomController(currentPlayerId)
                        updateRooms()
                    }
                    break;
                }

                case COMMAND.addUserToRoom: {
                    if (currentPlayerId) {
                        const players = addUserController(currentPlayerId, JSON.parse(request.data) as AddUserToRoomPayload)

                        if (players) {
                            updateRooms()
                            const gameId = createGameController(players)
                            sendCreateGame(gameId, players)
                        }


                    }
                    break;
                }

                case COMMAND.addShips: {
                    const payload = JSON.parse(request.data) as AddShipsPayload
                    const updatedGame = addShipsController(payload)

                    if (updatedGame.players.every((player)=> player.ships.length > 0)) {
                        startGameController(updatedGame.idGame)
                        sendStartGame(updatedGame)
                        updateTurn(updatedGame.idGame)
                        sendTurn(updatedGame.idGame)
                        
                    }

                    break;
                }

                case COMMAND.attack: {
                    const payload = JSON.parse(request.data) as Attack
                    const resultList = attackShipController(payload)
                    sendAttackFeedback(payload, resultList)

                    if (resultList.length === 1 && resultList[0].status === SHOT_RESULT.miss) {
                        updateTurn(payload.gameId)
                    } 
                    
                    sendTurn(payload.gameId)
                }
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
    sockets.forEach(({socket}) => sendDataFromWS(socket, COMMAND.updateRoom, updateRoomsController()))
}

const sendCreateGame = (idGame: number, players: number[]) => {
    sockets.forEach((socketItem) => {
        if (socketItem.currentPlayer && players.includes(socketItem.currentPlayer)) {
            sendDataFromWS(socketItem.socket, COMMAND.createGame, {
                idGame,
                idPlayer: socketItem.currentPlayer,
            })
        }
    })
}

const updateSocketWithPlayerId = (socketId: number, currentPlayerId: number) => {
    const socket = sockets.find((socket) => socket.id === socketId)

    if (socket) {
        socket.currentPlayer = currentPlayerId
    }
}

const sendStartGame = (game: Game) => {
    sockets.forEach((socketItem)=> {
        const playerData = game.players.find((player) => player.id === socketItem.currentPlayer)

        if (socketItem.currentPlayer && playerData) {
            sendDataFromWS(socketItem.socket, COMMAND.startGame, {
                ships: playerData.ships,
                currentPlayerIndex: playerData.id,
            })
        }
    })
}

const sendTurn  = (gameId: number) => {
    sockets.forEach((socketItem) => {
        const game = getGame(gameId)
        const playerData = game?.players.find((player) => player.id === socketItem.currentPlayer)

        if (socketItem.currentPlayer && playerData) {
            sendDataFromWS(socketItem.socket, COMMAND.turn, {
                currentPlayer: game?.turn
            })
        }
    })
}

const sendAttackFeedback = (attackInfo: Attack, resultList: AttackResult[]) => {
    sockets.forEach((socketItem) => {
        const game = getGame(attackInfo.gameId)
        const playerData = game?.players.find((player) => player.id === socketItem.currentPlayer)

        if (socketItem.currentPlayer && playerData) {
            resultList.forEach(({position, status})=> {
                sendDataFromWS(socketItem.socket, COMMAND.attack, {
                    currentPlayer: game?.turn,
                    position,
                    status,
                })
            })
            
        }
    })
}