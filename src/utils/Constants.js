import {
    Dimensions,
    Alert,
    Platform, StatusBar
} from 'react-native';


const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height, width } = Dimensions.get('window');

export const isIPhoneX = () => Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? width === X_WIDTH && height === X_HEIGHT || width === XSMAX_WIDTH && height === XSMAX_HEIGHT
    : false;

export const StatusBarHeight = Platform.select({
    ios: isIPhoneX() ? 40 : 20,
    android: StatusBar.currentHeight,
    default: 0
})

export function isIOS(){
    return Platform.OS == 'ios' ? true : false;
}

const Constants = {
    isTest: true,
    BUTTON_IN : "In",
    BUTTON_OUT : "Out",
    BUTTON_TRANSFER : "Transfer",
    BUTTON_STARTLUNCH : "Start Lunch",
    BUTTON_ENDLUNCH : "End Lunch",
    BUTTON_STARTBREAK : "Start Break",
    BUTTON_ENDBREAK : "End Break",

    USER_SERVER : 'treeringClockServer',
    USER_COMPANY_CODE : 'companyCode',
    USER_EMAIL : 'email',
    CURRENT_USER : 'currentUser',

    TimeTypePayableWorked : 1,
    TimeTypePayableNotWorked : 2,
    TimeTypeNotPayable : 4,

    WINDOW_WIDTH :  Dimensions.get('window').width,
    WINDOW_HEIGHT : Dimensions.get('window').height,
    CELL_WIDTH : ( Dimensions.get('window').width - 50 ) / 3 ,
    
    Months : ['Jan', 'Feb','Mar','Apr', 'May','Jun','Jul','Org','Sep','Oct','Nov','Dec'],
    Days : ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'],

    ucfirst: (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    lcfirst: (string) => {
        return string.charAt(0).toLowerCase() + string.slice(1);
    },

    emptyString: (str) => {
        if (str != null) {
            str.replace(' ', '');
        }
        return str == "" || str == null;
    },

    numberToFix2 : (val)=>{        
        let number = parseFloat(val);
        if(!number){
            return null;
        }
        return number.toFixed(2)    
    },
    
    getDateStr:(date)=>{

        console.log('getDateStr function: ', typeof date, date);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();
        if(month < 10){
            month = '0'+month
        }
        if(day < 10){
            day = '0'+day
        }
        if(hour < 10){
            hour = '0'+hour
        }
        if(mins < 10){
            mins = '0'+mins
        }
        return year+'-'+month+'-'+day;
    },
    
    getTimeStr:(date)=>{
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if(month < 10){
            month = '0'+month
        }
        if(day < 10){
            day = '0'+day
        }
        if(hour < 10){
            hour = '0'+hour
        }
        if(mins < 10){
            mins = '0'+mins
        }

        return hour+':'+mins+':00';
    },

     shortString : (value, len =30)=>{
        try{
            if( value.length > len){
                let res =  value.substr(0,len) + ' ...'
                return res
            }
            return value
    
        }catch( ex ){
            
            return null
        }        
    },

    
    getDateTimeStr: (dateTimeObj, showSeconds = false)=>{
        // console.log('getDateTimeStr in function params: ', dateTimeObj)
        let h = dateTimeObj.getHours();
        let m = dateTimeObj.getMinutes();
        let s = dateTimeObj.getSeconds();
        h = h < 10 ? '0'+h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;

        if( showSeconds == true ){
            return Constants.getDateStr(dateTimeObj) + ' ' + h + ':' + m + ':' + s;
        }else{
            return Constants.getDateStr(dateTimeObj) + ' ' + h + ':' + m ;
        }
    },

    

    style:{
        defaultShadow:{
            elevation: 5,                
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.2,
        }
    },
    

    orange: "#E98123",
    lightOrange:"#FBC390",
    placeholderColor: '#fff8',
    fbColor: '#475993',
    googleColor: '#dd4b39',
    lightGoogleColor: '#F2A299',
    menuInactiveColor: '#4D4D4D',
    backWhite: '#E7F6FB',
    white: '#FFFFFF',
    lightBlue: '#64C7D1',
    green: '#97C211', // 119F3B
    lightGreen: '#D3E59C', 
    black:'#000',
    titleColor: '#707070',
    grayColor: '#a9a9a9',
    redColor: '#DB3351',
    blueColor: '#309dfe',
    purpleColor:'#6733BB',
    opacityPurpleColor:'#6733BBBB',
    opacityBlack:'#00000099',
    transparent : 'rgba(0,0,0,0)',
    LocationTaskName : 'location_back',
    
    yellow:'#F5B024',

    darkGold: '#BE8C22',
    lightGold: '#D5BD7E',

    checkoutBackLight: '#977725',
    checkoutBackDark : '#543A05',
    greyWhite: '#AFAFAF',
    darkWhite: '#9a9a9a',
 

    backColor: '#ffffff',
    secondBack: '#FFFFFF',

    secondaryColor:'#1269A8',
    lightSecondColor: '#7EBAE5', 

    primaryColor:'#002F51',





}

export default Constants;

export const SCANDITLICKEY = "AaZPCS+jMBY1KzUqhgIa/pcLd2ajMNO/Dy5XkP52n/aRXBMXfHAZRBFLkzPsTC48NHURbJpMe+P/WJQbBRmy1RdFVbPqUT2NGR+X2fVOT2JSXJlF9gCfZ2APEOt1HHXwj0AfsxV7/IETXPznzJSNONuUMAAf3lZfAt8vx8BInsPO5WQrUGCx7W2/82uEkQehCu+6VbQdZcouhJ3MT3uqnV6DephiwvAUcKWudenYS1egbo9vks6uv2YDUQ8h/W5Kj/eW1VaOByBNaU9DCuGa9uTydsOy77TPHjLAEFiJgK3QlCyY1HgBzX28PcQHiWmr+CtogAHCCvR33fAf3NaWR4vW6UuxXyF+WpHerq1acO8itk7nBSjia49xBzkIH1HkXQmaKmq/v3a3oHMOThTPrerPQUtqDETI0jLG27rNXrvedS+IcDihfTtOFvwNSmNX5dumnp+A4OAlmk3P01aXb/Qza9H65HZtMRaIXv1ksjqJmAR3rX4uXQByCbxrn56iNodTViyp/1jS6amuwwd+HcbF1pk6k+XFhNQr8HvLJPcUzUBZZiEqeXI4EQNhdx2X+alK3EZLhnpWlfm7l2dvfyUQQsHnXHhv2Li9g50OKXg/zQxMoBHDwN78seFCMhX4+V0rkPfEFENF75MTfcmKwdXzFqbnWBb7ts63svngGX8h3wYCEjbENW4F9zAC+Pw0h3Wwyc8xAhbBJ8gFvxPeqkKCDt9cdxlVZnTkImNEoUHGPpHN6ecO7PKvX3d00qVhfw6lzR4vpaDBelHdKJ4iERQMi4TOuUHt2f6qnASkePihYTbe"