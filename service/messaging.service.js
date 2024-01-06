const axios = require("axios");
const { API_SERVER } = require("../utils/constants");
module.exports.sendMessage = async (eventId, convId, sender, message) => {
  try {
    const response = await axios.post(
      `${API_SERVER}/api/messages/send`,
      {
        content: message,
        userId: sender,
        eventId: eventId,
        convId: convId,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
