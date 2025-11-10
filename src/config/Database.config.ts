import Logs from "@libs/Logs";
import { Dialect, Sequelize } from "sequelize";

const db: string = process.env.DB_NAME as string;
const username: string = process.env.DB_USER as string;
const password: string = process.env.DB_PSWD as string;
const host: string = process.env.DB_HOST as string;
const dialect: Dialect = "mysql";

const database = new Sequelize(db, username, password, {
  host,
  dialect,
});

try {
  const connect = async () => {
    await database.authenticate({
      logging: (sql: any) => Logs(["sql"], "sql", sql),
    });
    Logs(["god"], "start", "Connection has been established successfully");
  };
  connect();
} catch (err: any) {
  Logs(["global"], "error", err);
}

export default database;
