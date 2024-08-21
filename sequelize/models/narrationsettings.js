'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NarrationSettings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NarrationSettings.init({
    user_id: DataTypes.INTEGER,
    mute: DataTypes.BOOLEAN,
    speed: DataTypes.FLOAT,
    word_highlighting: DataTypes.BOOLEAN,
    sentence_highlighting: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'NarrationSettings',
    underscored: true,
  });
  return NarrationSettings;
};