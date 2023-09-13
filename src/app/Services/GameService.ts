import DatabaseService from "./DatabaseService";

export enum GameResult {
  W = "W",
  B = "B",
  T = "T",
}

export interface Game {
  id: number;
  white: string;
  black: string;
  result: GameResult;
  createdAt: string;
}

export default {
  async createTable() {
    return DatabaseService.createTable("games", {
      id: "integer primary key autoincrement",
      white: "text",
      black: "text",
      result: "text",
      createdAt: "text",
    });
  },
  async findGames(limit?: number, page?: number, orderBy?: string): Promise<Game[]> {
    return DatabaseService.findAll("games", limit, page, orderBy);
  },
  async findGame(id: number): Promise<Game> {
    return DatabaseService.findOne("games", id);
  },
  async createGame(data: Partial<Game>): Promise<Game> {
    data.createdAt = new Date().toISOString();
    return DatabaseService.create("games", data);
  },
  async updateGame(id: number, data: Partial<Game>): Promise<Game> {
    return DatabaseService.update("games", id, data);
  },
  async deleteGame(id: number) {
    const lastInsertedId = (await DatabaseService.findAll("games", 1, 1, "id desc"))[0].id;

    if (id !== lastInsertedId) {
      throw new Error("Can only delete last inserted id");
    }

    return DatabaseService.delete("games", id);
  }
}
