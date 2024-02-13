import { createPlayer, createRoom, getRoomsWithOnePlayer } from "./data-handlers"
import { COMMAND, CreatePlayerPayload } from "./types"

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