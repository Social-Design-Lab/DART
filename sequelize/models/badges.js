'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Badges extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Badges.init({
    user_id: DataTypes.INTEGER,
    module: DataTypes.STRING,
    section: DataTypes.STRING,
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    image_url: DataTypes.STRING,
    earned_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Badges',
    underscored: true,
  });
  return Badges;
};