import {Elysia, t} from "elysia";
import GameController from "./Http/GameController";
import ELOController from "./Http/ELOController";

export default () => (app: Elysia) =>{
  GameController(app)
  ELOController(app)

  return app;
}
