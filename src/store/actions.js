import { UPDATE_ROLE, UPDATE_SETTING, UPDATE_ASIN } from "./action_types";

export const updateRole = (role) => {
  return {
    type: UPDATE_ROLE,
    payload: role,
  };
};

export const updateSetting = (setting) => {
  return {
    type: UPDATE_SETTING,
    payload: setting,
  };
};

export const updateAsin = (asin) => {
  return {
    type: UPDATE_ASIN,
    payload: asin,
  };
};
