export interface CreatePlayerPayload  {
    name: string
    password: string
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

export type Winner = Pick<Player, 'name' | 'index'>

export enum COMMAND {
    reg='reg',
    createRoom= 'create_room',
    updateRoom ='update_room'
}