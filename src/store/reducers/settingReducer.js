import { UPDATE_SETTING} from '../action_types';


const initialState = {
    settingData: null,
  
};

const settingReducer = (state = initialState, action) => {
  switch (action.type) {
   
    case UPDATE_SETTING:
        return {
            ...state,
            settingData: action.payload
        }
        break;
    default :
        return state;
    
  }
  
};


export default settingReducer;
