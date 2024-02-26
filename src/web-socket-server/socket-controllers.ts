import { sockets } from "."
import { WebSocket } from 'ws';
import { getGame, getRoomsWithOnePlayer, winners } from "./data-handlers"
import { Attack, AttackResult, COMMAND, Game } from "./types"

export const sendDataFromWS = (ws: WebSocket, type: COMMAND, data: object) => {
    ws.send(JSON.stringify({
        type,
        data: JSON.stringify(data),
        id: 0
    }))
}

export const sendUpdateRooms = () => {
    sockets.forEach(({ socket }) => sendDataFromWS(socket, COMMAND.updateRoom, getRoomsWithOnePlayer()))
}

export const sendUpdatedWinners = () => {
    sockets.forEach(({ socket }) => sendDataFromWS(socket, COMMAND.updateWinners, winners))
}

export const sendCreateGame = (idGame: number, players: number[]) => {
    sockets.forEach((socketItem) => {
        if (socketItem.currentPlayer && players.includes(socketItem.currentPlayer)) {
            sendDataFromWS(socketItem.socket, COMMAND.createGame, {
                idGame,
                idPlayer: socketItem.currentPlayer,
            })
        }
    })
}

export const updateSocketWithPlayerId = (socketId: number, currentPlayerId: number) => {
    const socket = sockets.find((socket) => socket.id === socketId)

    if (socket) {
        socket.currentPlayer = currentPlayerId
    }
}

export const sendStartGame = (game: Game) => {
    sockets.forEach((socketItem) => {
        const playerData = game.players.find((player) => player.id === socketItem.currentPlayer)

        if (socketItem.currentPlayer && playerData) {
            sendDataFromWS(socketItem.socket, COMMAND.startGame, {
                ships: playerData.ships,
                currentPlayerIndex: playerData.id,
            })
        }
    })
}

export const sendTurn = (gameId: number) => {
    sockets.forEach((socketItem) => {
        const game = getGame(gameId)

        if (isSocketPlayerInGame(gameId, socketItem.currentPlayer)) {
            sendDataFromWS(socketItem.socket, COMMAND.turn, {
                currentPlayer: game?.turn
            })
        }
    })
}

export const sendFinishGame = (winPlayer: number, gameId: number) => {
    sockets.forEach((socketItem) => {
        if (isSocketPlayerInGame(gameId, socketItem.currentPlayer)) {
            sendDataFromWS(socketItem.socket, COMMAND.finish, {
                winPlayer,
            })
        }
    })
}

export const sendAttackFeedback = (attackInfo: Attack, resultList: AttackResult[]) => {
    sockets.forEach((socketItem) => {
        const game = getGame(attackInfo.gameId)

        if (isSocketPlayerInGame(attackInfo.gameId, socketItem.currentPlayer)) {
            resultList.forEach(({ position, status }) => {
                sendDataFromWS(socketItem.socket, COMMAND.attack, {
                    currentPlayer: game?.turn,
                    position,
                    status,
                })
            })

        }
    })
}

const isSocketPlayerInGame = (gameId: number, socketPlayerId?: number) => {
    const game = getGame(gameId)
    const player = game?.players.find((player) => player.id === socketPlayerId)

    return socketPlayerId && player
}
