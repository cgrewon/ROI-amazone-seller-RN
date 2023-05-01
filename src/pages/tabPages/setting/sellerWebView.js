import { WebView } from "react-native-webview";

import React from "react";
import { SafeAreaView, StyleSheet, View, StatusBar, Alert } from "react-native";

import { useDispatch, useSelector } from "react-redux";

import PageLoaderIndicator from "../../../components/PageLoaderIndicator";

import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../../../utils/Constants";

import RestAPI from "../../../utils/RestAPI";
import CookieManager from "@react-native-community/cookies";
import HeaderBar from "../../../components/HeaderBar";

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showLoader: false,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener("focus", () => {});
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  navChange = (e) => {
    console.log("e", e);

    console.log("navChange : e.url >> ", e.url);

    if (e.loading == false) {
      let isForLogin = e.url.indexOf("sign") != -1;
      let isForProductSearch =
        e.url.indexOf("productsearch") != -1 && !isForLogin;
      if (isForProductSearch) {
        this.props.navigation.goBack();

        return;

        CookieManager.get("https://sellercentral.amazon.com", true)
          .then((res) => {
            // CookieManager.get('https://rydedeal.com', true).then((res) => {
            console.log("CookieManager.get =>", res);
            if (Object.keys(res).length == 0) {
              throw "You have to sign in Amazon seller central.";
            }

            global.cookie = res;

            console.log("globalCookie: ", global.cookie);

            RestAPI.getSellerCentralResult("B07TFVD9BQ", {})
              .then((res) => {
                // Alert.alert('Success', JSON.stringify(res, null, 2))
                const processRes = RestAPI.processAws("B07TFVD9BQ", sampleRes);
                console.log("process answer : ", processRes);
                const label = RestAPI.getAwsRestrictionLabel(processRes.result);
                Alert.alert("ProcessREs", label);
              })
              .catch((err) => {
                Alert.alert(
                  "Error ",
                  "Error in product search result from seller central: ",
                  err.message
                );
              });
          })
          .catch((err) => {
            console.log("cookie manager get error:", err);
            Alert.alert("Seller Centeral Login", err);
          });
      }
    }
  };

  render() {
    const { navigation, asin } = this.props;

    const link =
      "https://sellercentral.amazon.com/productsearch/search?query=" + asin;

    return (
      <>
        <SafeAreaView style={{ flex: 0 }}></SafeAreaView>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.container}>
            <StatusBar
              barStyle={"dark-content"}
              backgroundColor={Constants.white}
              hidden={false}
            />
            <HeaderBar
              title={"Seller Central Login"}
              isShowRight={false}
              isBackLeft={true}
              isShowLeft={true}
              leftIconColor={Constants.green}
              onLeftButton={() => {
                navigation.goBack();
              }}
            />
            <WebView
              style={{
                flex: 1,
                marginTop: 60,
              }}
              source={{ uri: link }}
              onLoadStart={() => {
                this.setState({ showLoader: true });
              }}
              onLoadEnd={() => {
                this.setState({ showLoader: false });
              }}
              androidHardwareAccelerationDisabled={true}
              scalesPageToFit={false}
              onNavigationStateChange={this.navChange}
            ></WebView>
            <PageLoaderIndicator
              isPageLoader={this.state.showLoader}
              barStyle={"bar"}
              position={"top"}
              barColor={Constants.green}
              style={{
                top: 60,
              }}
            />
          </View>
        </SafeAreaView>
      </>
    );
  }
}

export default function () {
  const navigation = useNavigation();
  const route = useRoute();

  const dispatch = useDispatch();

  const curAsin = useSelector((state) => state.asin.curAsin);

  const asin = route.params?.asin;

  return (
    <Index
      navigation={navigation}
      route={route}
      dispatch={dispatch}
      asin={asin}
      curAsin={curAsin}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.backColor,
    alignItems: "stretch",
  },
  rowTop: {
    marginTop: 60,
    flexDirection: "row",
    height: 50,
    width: Constants.WINDOW_WIDTH,
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: Constants.white,
    borderBottomColor: Constants.greyWhite,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  rowMain: {
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: Constants.white,
    marginVertical: 2,
  },
});
