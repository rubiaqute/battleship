import { CreatePlayerPayload, Game, Player, Room, Winner } from "./types";

const players: Player[] = []
const rooms: Room[] = []
const winners: Winner[] = []
const games: Game[] = []

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

const getRoomIndex = (roomId: number) => {
    return rooms.findIndex((room) => room.roomId === roomId)
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

export const addUserToRoom = (currentPlayerId: number, roomId: number) => {
    const currentPlayer = getPlayer(currentPlayerId)
    const roomToIndex = getRoomIndex(roomId)

    if (currentPlayer && roomToIndex !== -1) {
        rooms[roomToIndex].roomUsers.push({
            name: currentPlayer.name,
            index: currentPlayer.index
        })

        return rooms[roomToIndex].roomUsers.map((user)=> user.index)
    }
}

export const createGame = (playersId: number[])=> {
    const newGame: Game = {
        turn: playersId[0],
        playersId,
        ships:[],
        idGame: games.length + 1
    }

    games.push(newGame)

    return newGame.idGame
}