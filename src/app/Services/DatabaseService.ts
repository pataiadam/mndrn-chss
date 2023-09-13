import { Database } from "bun:sqlite";
const db = new Database("database/chess.sqlite");

export default {
  createTable: async (table: string, columns: Record<string, string>) => {
    const query = db.query(`create table if not exists ${table} (${Object.entries(columns).map(([k, v]) => `${k} ${v}`).join(',')});`);
    return query.run();
  },
  findAll: async (table: string, limit?: number, page?: number, orderBy?: string): Promise<any[]> => {
    if (!limit || limit < 0 ) return db.query(`select * from ${table};`).all();

    const query = db.query(`select * from ${table} ${orderBy ? `order by ${orderBy}` : ''} limit ${limit} offset ${((page||0) - 1) * limit};`);
    return query.all();
  },
  findOne: async (table: string, id: number): Promise<any> => {
    const query = db.query(`select * from ${table} where id = ${id};`);
    return query.get();
  },
  create: async (table: string, data: any): Promise<any> => {
    const query = db.prepare(`insert into ${table} (${Object.keys(data).join(',')}) values (${Object.keys(data).map(k => `$${k}`).join(',')});`);
    const convertedData = Object.entries(data).reduce((acc, [k, v]) => {
      acc[`$${k}`] = v;
      return acc;
    }, {} as Record<string, any>);
    query.run(convertedData);
    return db.query(`select * from ${table} order by id desc limit 1;`).get();
  },
  update: async (table: string, id: number, data: any): Promise<any> => {
    const query = db.prepare(`update ${table} set ${Object.entries(data).map(([k]) => `${k} = $${k}`).join(',')} where id = ${id};`);
    const convertedData = Object.entries(data).reduce((acc, [k, v]) => {
      acc[`$${k}`] = v;
      return acc;
    }, {} as Record<string, any>);
    query.run(convertedData);
    return db.query(`select * from ${table} where id = ${id};`).get();
  },
  delete: async (table: string, id: number) => {
    const query = db.prepare(`delete from ${table} where id = $id;`);
    query.run({ $id: id });
  }
};
