import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';

const DatabaseManager = () => {
    useEffect(() => {
      const initializeDatabase = async () => {
        try {
          const db = await SQLite.openDatabaseAsync('dbMath.db');
          await db.execAsync(`

            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT NOT NULL,
              password TEXT NOT NULL,
              firstname TEXT NOT NULL,
              secondname TEXT NOT NULL
            );
          `);
          console.log('Base de datos iniciada.');
        } catch (error) {
          console.error('Database initialization error:', error);
        }
      };
      initializeDatabase();
    }, []);
    return null;
  };
  
  export default DatabaseManager;