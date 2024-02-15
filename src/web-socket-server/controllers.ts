import { addUserToRoom, createGame, createPlayer, createRoom, getRoomsWithOnePlayer } from "./data-handlers"
import { AddUserToRoomPayload, COMMAND, CreatePlayerPayload } from "./types"

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