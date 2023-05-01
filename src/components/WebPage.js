import { WebView } from "react-native-webview";

import React from "react";
import { SafeAreaView, StyleSheet, View, StatusBar } from "react-native";
import PageLoaderIndicator from "./PageLoaderIndicator";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../utils/Constants";
import ActionSheet from "./ActionSheet";
import HeaderBar from "./HeaderBar";

class WebPage extends React.Component {
  constructor(props) {
    super(props);
    const { link } = props;

    this.state = {
      showLoader: false,
      showMore: false,
      link: link,
      injectScript: props.injectJS ?? "",
    };

    this.webViewRef = React.createRef();
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener("focus", () => {});
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onWebviewLoadEnd = () => {};

  onWebViewPostMessage = (str) => {};

  onTapMore = (index, item) => {
    this.setState({ showMore: false });
    if (index == 0) {
      // TODO clean cooke
    } else if (index == 1) {
      // TODO clean local storage
    } else if (index == 2) {
      const script = this.getInjectScript();
      this.setState({ injectScript: script }, () => {
        this.webViewRef.current.reload();
      });
    }
  };

  navChange = (e) => {
    console.log("e", e);
    console.log("navChange : e.url >> ", e.url);
    if (e.loading == false) {
    }
  };

  render() {
    const { route, navigation, curRole, dispatch, title } = this.props;
    console.log(this.state.injectScript);
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
              title={title}
              isShowRight={false}
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
                this.setState({ showMore: true });
              }}
              onLeftButton={() => {
                navigation.goBack();
              }}
            />
            <WebView
              ref={this.webViewRef}
              androidHardwareAccelerationDisabled={true}
              style={{ flex: 1, marginTop: 60 }}
              source={{ uri: this.state.link }}
              onLoadStart={() => {
                this.setState({ showLoader: true });
                showPageLoader(true);
              }}
              onLoadEnd={() => {
                setTimeout(() => {
                  this.setState({
                    showLoader: false,
                  });
                  showPageLoader(false);
                }, 3000);

                this.onWebviewLoadEnd();
              }}
              scalesPageToFit={false}
              javaScriptEnabled={true}
              onShouldStartLoadWithRequest={(e) => {
                console.log("onShouldStartLoadWithRequest: ", e);
                return true;
              }}
              injectedJavaScript={this.state.injectScript}
              onMessage={(event) => {
                const { data } = event.nativeEvent;
                console.log(data);
                this.onWebViewPostMessage(data);
              }}
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
            <ActionSheet
              title={"Where would you like to do your research?"}
              titleList={["Clean Cookie", "Clean Local Storage", "Reload"]}
              isShow={this.state.showMore}
              onTapItem={(index, item) => {
                this.onTapMore(index, item);
              }}
              onCancel={() => {
                this.setState({ showMore: false });
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

  const link = route.params?.link;
  const title = route.params?.title;
  const rank = route.params?.rank;
  const category = route.params?.category;
  const injectJS = route.params?.injectJS;

  return (
    <WebPage
      navigation={navigation}
      route={route}
      injectJS={injectJS}
      title={title}
      link={link}
      rank={rank}
      category={category}
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
