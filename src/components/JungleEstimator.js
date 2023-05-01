import {WebView} from 'react-native-webview';

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  Alert,
} from 'react-native';

import PageLoaderIndicator from './PageLoaderIndicator';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import Constants from '../utils/Constants';
import ActionSheet from './ActionSheet';
import HeaderBar from './HeaderBar';

class JungleEstimator extends React.Component {
  constructor(props) {
    super(props);
    const {link} = props;

    let initScript =
      link == 'https://junglescout.com/estimator'
        ? this.getInjectForInit()
        : '';

    this.state = {
      showLoader: false,
      showMore: false,
      isLocalStorageClean: false,
      injectScript: initScript,
      link: link,
    };

    this.webViewRef = React.createRef();
  }

  componentDidMount() {
    const {navigation} = this.props;
    
  }

  componentWillUnmount() {    
  }

  getInjectScript = () => {
    let myInjectedJs = `(function(){

      function postCookies(){

        var cookies = { };

        if (document.cookie && document.cookie != '') {
            var split = document.cookie.split(';');
            for (var i = 0; i < split.length; i++) {
                var name_value = split[i].split("=");
                name_value[0] = name_value[0].replace(/^ /, '');
                cookies[decodeURIComponent(name_value[0])] = decodeURIComponent(name_value[1]);
            }
        }
        // var timestamp = Date.now();
        // window.ReactNativeWebView.postMessage(timestamp + ' @ cookies arr: ' + JSON.stringify(cookies, null, 2));
    
      }

      function postLocalStorage(){
        var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;

        while ( i-- ) {
            values.push( localStorage.getItem(keys[i]) );
        }

        // var timestamp = Date.now();

        // var str = timestamp + ' @ localStorageItems >>> :' + JSON.stringify(values, null, 2)
       
        // window.ReactNativeWebView.postMessage(str);
      }

      function deleteAllCookies() {
        var cookies = document.cookie.split(";");
    
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }

        
    }

      postLocalStorage()

      postCookies()

      window.localStorage.clear()

      deleteAllCookies()

      window.ReactNativeWebView.postMessage('cleaned');


    })();`;

    return myInjectedJs;
  };

  getInjectForAjax = () => {
    let rank = this.props.rank;
    let category = this.props.category;

    let apiLink = this.getLink(rank, category);

    let ajaxInPage = `      
    (function(){
     
       setTimeout(()=>{
          document.getElementsByName('theRankInput')[0].value = ${rank};
          // document.querySelectorAll('li|[data-store="us"]')[0].click()

        const Http = new XMLHttpRequest();
        const url='${apiLink}';
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange=(e)=>{
          console.log(Http.responseText)
          

          if(Http.responseText && Http.responseText.length > 0){
            window.ReactNativeWebView.postMessage('response:' + Http.responseText);
            
            let res = JSON.parse(Http.responseText)
            document.getElementsByClassName('js-magic-result')[0].innerHTML = res.estSalesResult
          

          }else{
            window.ReactNativeWebView.postMessage('response-none');
          }
        }
       }, 3000)
      
     })();`;
    console.log(ajaxInPage);
    return ajaxInPage;
  };

  getInjectForInit = () => {
    let ajaxInPage = `      
    (function(){

      setTimeout(()=>{
        window.ReactNativeWebView.postMessage('initloaded');
      }, 1000)
        
     })();`;

    return ajaxInPage;
  };

  getLink = (rank, category) => {
    let encodedCategory = encodeURIComponent(category);
    let link =
      'https://api.junglescout.com/api/v1/sales_estimator?rank=' +
      rank +
      '&category=' +
      encodedCategory +
      '&store=us';

    return link;
  };

  onWebviewLoadEnd = () => {
    
  };

  onWebViewPostMessage = (str) => {
    // return;
    if (str == 'cleaned') {
      console.log('reload with ajax call inject script: ');

      setTimeout(() => {
        let script = this.getInjectForAjax();
        this.setState({injectScript: script}, () => {
          this.webViewRef.current.reload();
        });
      }, 4000);
    } else if (str.indexOf('response:') != -1) {
      if(this.props.isPage){
        Alert.alert('Result',str)
      }
      if (this.props.onResult) {
        this.props.onResult(str);
      }
    } else if (str == 'initloaded') {
      if (this.props.onBegin) {
        this.props.onBegin();
      }
      setTimeout(() => {
        const script = this.getInjectScript();
        this.setState({injectScript: script}, () => {
          this.webViewRef.current.reload();
        });
      }, 3000);
    } else if (str == 'response-none') {
      if (this.props.onError) {
        this.props.onError();
      }
    }
  };

  onTapMore = (index, item) => {
    this.setState({showMore: false});
    if (index == 0) {
      // TODO clean cooke
    } else if (index == 1) {
      // TODO clean local storage
     
    } else if (index == 2) {
      const script = this.getInjectScript();
      this.setState({injectScript: script}, () => {
        this.webViewRef.current.reload();
      });
    }
  };

  navChange = (e) => {
    console.log('e', e);

    console.log('navChange : e.url >> ', e.url);

    if (e.loading == false) {
     
    }
  };

  render() {
    const {route, navigation, curRole, dispatch, title, isPage} = this.props;

    const moreStyles = isPage
      ? {
          flex: 1,
        }
      : {height: 1};

    let main = (
      <>
        <WebView
          ref={this.webViewRef}
          style={{flex: 1, marginTop: 60}}
          source={{uri: this.state.link}}
          onLoadStart={() => {
            this.setState({showLoader: true});
          }}
          onLoadEnd={() => {
            this.setState({showLoader: false});
            this.onWebviewLoadEnd();
          }}
          scalesPageToFit={false}
          onNavigationStateChange={this.navChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          injectedJavaScript={this.state.injectScript}
          useWebKit={true}
          androidHardwareAccelerationDisabled={true}
          onMessage={(event) => {
            const {data} = event.nativeEvent;
            console.log(data);
            this.onWebViewPostMessage(data);
          }}></WebView>
        <PageLoaderIndicator
          isPageLoader={this.state.showLoader}
          barStyle={'bar'}
          position={'top'}
          barColor={Constants.green}
          style={{
            top: 60,
          }}
        />
        <ActionSheet
          title={'Where would you like to do your research?'}
          titleList={['Clean Cookie', 'Clean Local Storage', 'Reload']}
          isShow={this.state.showMore}
          onTapItem={(index, item) => {
            this.onTapMore(index, item);
          }}
          onCancel={() => {
            this.setState({showMore: false});
          }}
        />
      </>
    );

    return isPage ? (
      <>
        <SafeAreaView style={{flex: 0}}></SafeAreaView>
        <SafeAreaView style={{flex: 1}}>
          <View style={{...styles.container,  ...moreStyles}}>
            <StatusBar
              barStyle={'dark-content'}
              backgroundColor={Constants.white}
              hidden={false}
            />
            <HeaderBar
              title={title}
              isShowRight={true}
              isBackLeft={true}
              isShowLeft={true}
              leftIconColor={Constants.green}
              rightIcon={
                <Feather
                  name="more-vertical"
                  size={25}
                  color={Constants.green}
                />
              }
              onRightButton={() => {
                this.setState({showMore: true});
              }}
              onLeftButton={() => {
                navigation.goBack();
              }}
            />
            {main}
          </View>
        </SafeAreaView>
      </>
    ) : (
      <View style={{...styles.container, ...moreStyles}}>
        {main}
      </View>
    );
  }
}

export default function ({category, rank, onResult, onBegin, onError}) {
  const navigation = useNavigation();
  const route = useRoute();
  const categoryVal = category ?? route.params?.category;

  const rankVal = rank ?? route.params?.rank;

  const title = 'JungleEstimator';

  const link = 'https://junglescout.com/estimator';

  return (
    <JungleEstimator
      navigation={navigation}
      route={route}
      isPage={!!route.params?.category}
      title={title}
      link={link}
      rank={rankVal}
      category={categoryVal}
      onBegin={onBegin}
      onError={onError}
      onResult={(str) => {
        if (onResult) {
          onResult(str);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: Constants.WINDOW_WIDTH,

    backgroundColor: Constants.backColor,

    alignItems: 'stretch',
  },
  rowTop: {
    marginTop: 60,
    flexDirection: 'row',
    height: 50,
    width: Constants.WINDOW_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Constants.white,
    borderBottomColor: Constants.greyWhite,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rowMain: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Constants.white,
    marginVertical: 2,
  },
});
