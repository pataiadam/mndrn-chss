import {Elysia, t} from "elysia";
import type {Game} from "../../Services/GameService";
import GameService, {GameResult} from "../../Services/GameService";

GameService.createTable().then(() => {
  console.log("🦊 Game table created")
})

export default (app: Elysia) => {
  app.get("/games", async ({query}) => {
    const games: Game[] = await GameService.findGames(query.limit || 100, query.page || 1, "id desc");
    return {
      success: true,
      meta: {
        total: games.length,
        limit: query.limit || 10,
        page: query.page || 1,
      },
      data: games
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.Number()),
      page: t.Optional(t.Number()),
    }),
    response: t.Object({
      success: t.Boolean(),
      meta: t.Object({
        total: t.Number(),
        limit: t.Number(),
        page: t.Number(),
      }),
      data: t.Array(t.Object({
        id: t.Number(),
        white: t.String(),
        black: t.String(),
        result: t.String(),
        createdAt: t.String(),
      }))
    })
  })

  app.post("/games", async ({body}) => {
    const game: Game = await GameService.createGame(body);
    return {
      success: true,
      data: game
    }
  }, {
    body: t.Object({
      white: t.String(),
      black: t.String(),
      result: t.Enum(GameResult),
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Object({
        id: t.Number(),
        white: t.String(),
        black: t.String(),
        result: t.String(),
        createdAt: t.String(),
      })
    })
  })

  app.delete("/games/:id", async ({params}) => {
    await GameService.deleteGame(parseInt(params.id));
    return {
      success: true,
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    response: t.Object({
      success: t.Boolean(),
    })
  })

  app.put("/games/:id", async ({params, body}) => {
    const game: Game = await GameService.updateGame(parseInt(params.id), body);
    return {
      success: true,
      data: game
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      white: t.Optional(t.String()),
      black: t.Optional(t.String()),
      result: t.Optional(t.Enum(GameResult)),
    }),
    response: t.Object({
      success: t.Boolean(),
      data: t.Object({
        id: t.Number(),
        white: t.String(),
        black: t.String(),
        result: t.String(),
        createdAt: t.String(),
      })
    })
  })
}
