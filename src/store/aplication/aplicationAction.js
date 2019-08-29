import { ActionTypes } from "../constants";
import AsyncStorage from "@react-native-community/async-storage";
import { IntialUser } from "../../utils/constans";
import { createFolder } from "../../utils/utils";
import {
  writteUser,
  getUserData,
  deleteAllContacts
} from "../../database/realmDatabase";
import Bitcoin from "../../utils/Bitcoin";

const bitcoin = new Bitcoin();

export const InitialState = () => async dispatch => {
  // deleteAllContacts();
  const address = await bitcoin.generateAddress();
  console.log(address);
  getUserData().then(async res => {
    if (res.length) {
      await createFolder();
      dispatch(writeAction(JSON.parse(JSON.stringify(res[0]))));
    } else {
      const result = await writteUser(IntialUser);
      dispatch(writeAction(result));
    }
  });
};

const writeAction = data => {
  return {
    type: ActionTypes.INITIAL_STATE,
    payload: data
  };
};

export const changeTab = tab => {
  return {
    type: ActionTypes.CHANGE_TAB,
    payload: tab
  };
};
