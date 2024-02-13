import { CreatePlayerPayload, Player, Room, Winner } from "./types";

const players: Player[] = []
const rooms: Room[] = []
const winners: Winner[] = []

export const createPlayer = ({name, password}: CreatePlayerPayload)=> {
    const newPlayer: Player = {
        name,
        password,
        index: players.length + 1
    }
    players.push(newPlayer)

    return {
        name: newPlayer.name,
        index: newPlayer.index
    }
}

const getPlayer = (playerId: number) => {
    return players.find((player) => player.index === playerId)
}

export const getRoomsWithOnePlayer = () => {
    return rooms.filter((room)=> room.roomUsers.length === 1)
}

export const createRoom = (currentPlayerId: number) => {
    const currentPlayer = getPlayer(currentPlayerId)

    if (currentPlayer) {
        const newRoom = {
            roomId: rooms.length + 1,
            roomUsers: [{
                name: currentPlayer.name,
                index: currentPlayer.index
            }]
        }

       rooms.push(newRoom)
    }
}