require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    await connection.end();

    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
        }
    );

    const Repository = sequelize.define('Repository', {
        name: { type: DataTypes.STRING, allowNull: false },
        githubUrl: { type: DataTypes.STRING, allowNull: false },
    });

    const DailyStat = sequelize.define('DailyStat', {
        clones: { type: DataTypes.INTEGER, defaultValue: 0 },
        uniqueClones: { type: DataTypes.INTEGER, defaultValue: 0 },
        views: { type: DataTypes.INTEGER, defaultValue: 0 },
        uniqueViews: { type: DataTypes.INTEGER, defaultValue: 0 },
        date: { type: DataTypes.DATEONLY, allowNull: false },
    });

    Repository.hasMany(DailyStat, { foreignKey: 'repositoryId' });
    DailyStat.belongsTo(Repository, { foreignKey: 'repositoryId' });

    await sequelize.sync({ alter: true });  // DB Sync

    return { sequelize, Repository, DailyStat };
}

module.exports = initializeDatabase;
