import React from "react";

import configureStore from "./src/store/store";
import { Provider, connect } from "react-redux";
import { LogBox } from "react-native";
import Forage from "react-native-forage";

import { AppState, StyleSheet, View, Text, StatusBar } from "react-native";

Forage.start("8855e277-6297-4e2e-bd19-4d8fb01e509c", AppState);

import { Colors } from "react-native/Libraries/NewAppScreen";
import Toast from "react-native-toast-message";
import Constants from "./src/utils/Constants";
import SplashScreen from "react-native-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import PageLoaderIndicator from "./src/components/PageLoaderIndicator";

import Login from "./src/pages/login";
import SellerWebView from "./src/pages/tabPages/setting/sellerWebView";

import BottomTabNavigation from "./src/navigation/BottomTabNavigation";
import IdealBuy from "./src/pages/tabPages/setting/idealBuy";
import SearchDetail from "./src/pages/tabPages/search/detail";

import WebPage from "./src/components/WebPage";

import JungleEstimator from "./src/components/JungleEstimator";

import crashlytics from "@react-native-firebase/crashlytics";
import Signup from "./src/pages/signup";

const Stack = createStackNavigator();

console.warn = () => {};
LogBox.ignoreAllLogs();

const toastConfig = {
  success: ({ text1, text2, props, ...rest }) => (
    <View
      style={{
        width: "100%",
        backgroundColor: Constants.primaryColor,
        paddingVertical: 10,
        paddingHorizontal: 8,
      }}
    >
      <Text style={{ fontSize: 15, color: Constants.white }}>{text1}</Text>
      <Text style={{ fontSize: 13, color: Constants.white }}>{text2}</Text>
    </View>
  ),
  error: () => {},
  info: () => {},
  any_custom_type: ({ text1, text2, props, ...rest }) => (
    <View
      style={{
        width: "100%",
        backgroundColor: Constants.primaryColor,
        paddingVertical: 10,
        paddingHorizontal: 8,
      }}
    >
      <Text style={{ fontSize: 15, color: Constants.white }}>{text1}</Text>
      <Text style={{ fontSize: 13, color: Constants.white }}>{text2}</Text>
    </View>
  ),
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowPageLoader: false,
      loadingText: "",
    };
    global.curUser = {};
  }

  init = async () => {
    global.showPageLoader = (isShow, text = "") => {
      this.setState({ isShowPageLoader: isShow, loadingText: text });
    };
  };

  componentDidMount() {
    SplashScreen.hide();

    this.init();
    Forage.trackEvent("Customer Checkout Press");
    crashlytics().log("App mounted.");
  }

  componentWillUnmount() {}

  render() {
    const { isShowPageLoader } = this.state;
    return (
      <Provider store={configureStore}>
        <StatusBar barStyle="light-content" />

        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={"login"}
              headerMode="none"
              mode={"slide"}
            >
              <Stack.Screen name="login" component={Login} />
              <Stack.Screen name="signup" component={Signup} />
              <Stack.Screen name="bottom_tab" component={BottomTabNavigation} />
              <Stack.Screen name="ideal_buy_detail" component={IdealBuy} />
              <Stack.Screen name="item_detail" component={SearchDetail} />

              <Stack.Screen name="sellerwebview" component={SellerWebView} />
              <Stack.Screen name="webpage" component={WebPage} />
              <Stack.Screen
                name="junglescoutpage"
                component={JungleEstimator}
              />
            </Stack.Navigator>
          </NavigationContainer>

          <StatusBar hidden={false} />
          <Toast ref={(ref) => Toast.setRef(ref)} config={toastConfig} />
        </SafeAreaProvider>
        <PageLoaderIndicator
          loaderStyle={"ball"}
          isPageLoader={isShowPageLoader}
          barColor={Constants.darkGold}
          text={this.state.loadingText}
        />
      </Provider>
    );
  }
}

export default App;
