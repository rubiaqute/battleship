import {WebSocket } from 'ws';

export interface CreatePlayerPayload  {
    name: string
    password: string
}

export interface AddUserToRoomPayload {
    indexRoom: number
}

export interface Room {
    roomId: number
    roomUsers: {
        name: string,
        index: number
    }[]
}

export interface Player {
    name: string
    password: string
    index: number
}

export interface Game {
    idGame: number
    ships: Ship[]
    turn: number
    playersId: number[]
}

export interface Ship {
    position: {
        x: number,
        y: number,
    },
    direction: boolean,
    length: number,
    type: "small" | "medium" | "large" | "huge",
}

export type Winner = Pick<Player, 'name' | 'index'>

export enum COMMAND {
    reg='reg',
    createRoom= 'create_room',
    updateRoom ='update_room',
    addUserToRoom = "add_user_to_room",
    createGame = "create_game"
}

export interface Socket {
    id: number
    socket: WebSocket
    currentPlayer?: number
}