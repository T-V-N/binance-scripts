import axios from "axios";
import crypto from "crypto";
import qs from "qs";

const buildSign = (data) => {
  return crypto
    .createHmac("sha256", process.env.API_SECRET)
    .update(data)
    .digest("hex");
};

const privateRequest = async (data, endPoint, type) => {
  const dataQueryString = qs.stringify(data);
  const signature = buildSign(dataQueryString);
  const requestConfig = {
    method: type,
    url:
      process.env.HOST_URL +
      endPoint +
      "?" +
      dataQueryString +
      "&signature=" +
      signature,
    headers: {
      "X-MBX-APIKEY": process.env.API_KEY,
    },
  };
  try {
    const response = await axios(requestConfig);
    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const publicRequest = async (data, endPoint, type) => {
  const dataQueryString = qs.stringify(data);
  const requestConfig = {
    method: type,
    url: process.env.HOST_URL + endPoint + "?" + dataQueryString,
  };

  try {
    const response = await axios(requestConfig);
    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export { privateRequest, publicRequest };
