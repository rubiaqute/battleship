import { addShips, addUserToRoom, attackShip, createGame, createPlayer, createRoom, getRoomsWithOnePlayer, startGame, updateTurn } from "./data-handlers"
import { Battleship } from "./game"
import { AddShipsPayload, AddUserToRoomPayload, Attack, COMMAND, CreatePlayerPayload, Game } from "./types"

export const registerPlayerController = (payload: CreatePlayerPayload) => {
    const {name, index} = createPlayer(payload)

    return {
            name,
            index,
            error: false,
            errorText: "",
        }
}

export const updateRoomsController = () => {
    return  getRoomsWithOnePlayer()
}

export const createRoomController = (currentPlayerId: number)=> {
    createRoom(currentPlayerId)
}

export const addUserController = (currentPlayerId: number, { indexRoom }: AddUserToRoomPayload) => {
    return addUserToRoom(currentPlayerId, indexRoom)
}

export const createGameController = (playersId:number[]) => {
    return createGame(playersId)
}

export const addShipsController = (payload: AddShipsPayload) => {
    return addShips(payload)
}

export const updateTurnController = (gameId: number) => {
    return updateTurn(gameId)
}

export const startGameController = (gameId: number) => {
    startGame(gameId)
}

export const attackShipController = (attackInfo: Attack) => {
    return attackShip(attackInfo)
}