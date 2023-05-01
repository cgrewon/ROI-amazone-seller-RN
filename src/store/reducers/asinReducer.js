import { UPDATE_ASIN} from '../action_types';


const initialState = {
  curAsin: null,
  
};

const asinReducer = (state = initialState, action) => {
  switch (action.type) {
   
    case UPDATE_ASIN:
        return {
            ...state,
            curAsin: action.payload
        }
        break;
    default :
        return state;
  }
};


export default asinReducer;
