import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { updateSetting } from "../../../store/actions";
import Feather from "react-native-vector-icons/Feather";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "../../../utils/Constants";
import Utils from "../../../utils/Utils";

import RestAPI from "../../../utils/RestAPI";
import { InputOutLine } from "../../../components/Inputs";
import ActionSheet from "../../../components/ActionSheet";

import HeaderBar from "../../../components/HeaderBar";
import { Platform } from "react-native";

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      showKeepDaysPicker: false,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener("focus", () => {
      this.loadSetting();
    });
  }

  loadSetting = () => {
    const data = {
      api_version: 1,
      user_id: global.curUser.id,
    };

    showPageLoader(true);
    RestAPI.generalPost("app/get_settings", data)
      .then((res) => {
        showPageLoader(false);
        if (res?.status == 1) {
          this.setState({ data: res.data });
        } else {
          Alert.alert("Failed to get settings", res.message);
        }
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  updateSetting = () => {
    const { dispatch } = this.props;

    const setting = { ...this.state.data };
    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      inc_font_size: setting.inc_font_size,
      keep_history: setting.keep_history,
      check_restrictions: setting.check_restrictions,
      desired_roi: setting.desired_roi,
      use_ideal_buy: setting.use_ideal_buy,
      amz_is_not_merchnat: setting.amz_is_not_merchnat,
      great_rank_only: setting.great_rank_only,
      shipping_rate: setting.shipping_rate,
      sales_tax: setting.sales_tax,
      prep_cost: setting.prep_cost,
    };

    showPageLoader(true);
    RestAPI.generalPost("app/update_settings", data)
      .then((res) => {
        showPageLoader(false);
        if (res?.status == 1) {
          dispatch(updateSetting(data));
        } else {
          Alert.alert("Failed to update setting information", "");
        }
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });
  };

  logout = () => {
    const { navigation } = this.props;
    const data = {
      api_version: 1,
      user_id: global.curUser.id,
      device_id: global.curUser.device_id,
    };

    showPageLoader(true);
    RestAPI.generalPost("app/logout", data)
      .then(async (res) => {
        showPageLoader(false);
        if (res?.status == 1) {
          await Utils.removeCurUser();
          navigation.popToTop();
        } else {
          Alert.alert("Failed to logout", "");
        }
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });
  };

  toggleIncFont = (val) => {
    const newData = {
      ...this.state.data,
      inc_font_size: !val ? 0 : 1,
    };
    this.setState(
      {
        data: newData,
      },
      () => {
        this.updateSetting();
      }
    );
  };

  toggleCheckRestriction = (val) => {
    const newData = {
      ...this.state.data,
      check_restrictions: !val ? 0 : 1,
    };
    this.setState(
      {
        data: newData,
      },
      () => {
        this.updateSetting();
      }
    );
  };

  onRefIncFontSize = () => {
    Toast.show({
      text1: "Information",
      text2:
        "This setting affects the font size on the details screen of Search , History and Buy List pages. ",

      topOffset: Platform.OS == "ios" ? 40 : 0,
    });
  };

  onRefROI = () => {
    Toast.show({
      text1: "Information",
      text2:
        "Tell us your desired ROI, and we will tell you the buy cost necessary to achieve it!",

      topOffset: Platform.OS == "ios" ? 40 : 0,
    });
  };

  onSelectKeepHistoryDays = () => {
    this.setState({ showKeepDaysPicker: true });
  };

  onIdealBuy = () => {
    const { navigation } = this.props;
    navigation.navigate("ideal_buy_detail", { data: this.state.data });
  };

  onClearHistory = () => {
    Alert.alert("Confirm", "Are you sure to clear history?", [
      {
        style: "default",
        text: "Yes",
        onPress: () => {
          const data = {
            api_version: 1,
            user_id: global.curUser.id,
          };

          showPageLoader(true);
          RestAPI.generalPost("app/clear_history", data)
            .then((res) => {
              showPageLoader(false);
              if (res?.status == 1) {
              } else {
                Alert.alert("Failed to Clear", "");
              }
            })
            .catch((err) => {
              showPageLoader(false);
              Alert.alert("Failed", err.message);
            });
        },
      },
      {
        style: "cancel",
        text: "No",
      },
    ]);
  };

  render() {
    const { navigation } = this.props;

    let settingData = this.state.data;

    let keep_history = Utils.strToInt(settingData?.keep_history, 0);
    let check_restrictions = Utils.strToInt(settingData?.check_restrictions, 0);
    let desired_roi = settingData?.desired_roi;
    let use_ideal_buy = Utils.strToInt(settingData?.use_ideal_buy, 0);
    let amz_is_not_merchnat = Utils.strToInt(
      settingData?.amz_is_not_merchnat,
      0
    );
    let great_rank_only = Utils.strToInt(settingData?.great_rank_only, 0);

    let shipping_rate = settingData?.shipping_rate; //Utils.strToFloat(settingData?.shipping_rate, 0);
    let sales_tax = settingData?.sales_tax; //Utils.strToFloat(settingData?.sales_tax, 0);
    let prep_cost = settingData?.prep_cost;
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
              title={"Settings"}
              isShowRight={false}
              isBackLeft={false}
              isShowLeft={false}
            />
            <View style={styles.rowTop}>
              <Text
                style={{ color: Constants.primaryColor, fontSize: 17, flex: 1 }}
              >
                {global.curUser.username}
              </Text>
              <TouchableOpacity
                style={{
                  flex: 0,
                  flexDirection: "row",
                  paddingHorizontal: 5,
                  height: 40,
                  alignItems: "center",
                }}
                onPress={this.logout}
              >
                <Text style={{ color: Constants.green, fontSize: 15 }}>
                  LOG OUT
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 50 }}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <View style={{ flex: 0 }}>
                    <Feather
                      name={"settings"}
                      color={Constants.secondaryColor}
                      size={20}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                    }}
                  >
                    System
                  </Text>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 1,
                    }}
                  >
                    Keep History
                  </Text>

                  <TouchableOpacity
                    style={{ height: 40, justifyContent: "center" }}
                    onPress={this.onSelectKeepHistoryDays}
                  >
                    <Text style={{ fontSize: 15, color: Constants.green }}>
                      for Last {keep_history} Days
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 1,
                    }}
                  >
                    Clear History
                  </Text>

                  <TouchableOpacity
                    style={{ height: 40, justifyContent: "center" }}
                    onPress={this.onClearHistory}
                  >
                    <Feather
                      name="trash"
                      color={Constants.redColor}
                      size={25}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 0 }}>
                    <Feather
                      name={"info"}
                      color={Constants.secondaryColor}
                      size={20}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                    }}
                  >
                    Restrictions
                  </Text>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      navigation.navigate("sellerwebview");
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: Constants.secondaryColor,
                        marginLeft: 5,
                      }}
                    >
                      Sign into Seller Central
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 1,
                    }}
                  >
                    Check for Restrictions
                  </Text>

                  <Switch
                    trackColor={{
                      false: Constants.grayColor,
                      true: Constants.lightGreen,
                    }}
                    thumbColor={
                      check_restrictions == 1
                        ? Constants.green
                        : Constants.white
                    }
                    ios_backgroundColor={Constants.white}
                    onValueChange={(val) => {
                      this.toggleCheckRestriction(val);
                    }}
                    value={check_restrictions == 1}
                  />
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 0 }}>
                    <Feather
                      name={"smile"}
                      color={Constants.secondaryColor}
                      size={20}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                    }}
                  >
                    Enhancements
                  </Text>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 2,
                    }}
                  >
                    Desired ROI
                  </Text>
                  <InputOutLine
                    icon={
                      <Text
                        style={{
                          fontSize: 18,
                          color: Constants.secondaryColor,
                        }}
                      >
                        %
                      </Text>
                    }
                    value={"" + (desired_roi ?? "")}
                    onChangeText={(val) => {
                      this.setState({
                        data: {
                          ...this.state.data,
                          desired_roi: val,
                        },
                      });
                    }}
                    keyboardType={
                      Platform.OS == "android"
                        ? "default"
                        : "numbers-and-punctuation"
                    }
                    onSubmitEditing={() => {
                      this.updateSetting();
                    }}
                    style={{
                      // flex: 2,
                      // height: 34,
                      // backgroundColor: Constants.white,
                      // color: Constants.primaryColor,
                      // borderColor: Constants.greyWhite,

                      flex: 2,
                      height: 34,
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                      borderColor: Constants.greyWhite,
                    }}
                  />

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 40,
                      justifyContent: "center",
                      marginLeft: 10,
                      alignItems: "flex-end",
                    }}
                    onPress={this.onRefROI}
                  >
                    <Feather
                      name="info"
                      size={25}
                      color={Constants.green}
                    ></Feather>
                  </TouchableOpacity>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 1,
                    }}
                  >
                    Ideal Buy
                  </Text>

                  <TouchableOpacity
                    style={{
                      height: 40,
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                    onPress={this.onIdealBuy}
                  >
                    <Text style={{ fontSize: 15, color: Constants.green }}>
                      {use_ideal_buy == 1 ? "On" : "Off"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <View style={{ flex: 0 }}>
                    <Feather
                      name={"globe"}
                      color={Constants.secondaryColor}
                      size={20}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                    }}
                  >
                    Shipping, Taxes & Discounts
                  </Text>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 2,
                    }}
                  >
                    Shipping Rate
                  </Text>
                  <InputOutLine
                    icon={
                      <Text
                        style={{
                          fontSize: 18,
                          color: Constants.secondaryColor,
                        }}
                      >
                        $
                      </Text>
                    }
                    value={"" + (shipping_rate ?? "")}
                    onChangeText={(val) => {
                      this.setState({
                        data: {
                          ...this.state.data,
                          shipping_rate: val,
                        },
                      });
                    }}
                    keyboardType={
                      Platform.OS == "android"
                        ? "default"
                        : "numbers-and-punctuation"
                    }
                    onSubmitEditing={() => {
                      this.updateSetting();
                    }}
                    style={{
                      flex: 2,
                      height: 34,
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                      borderColor: Constants.greyWhite,
                    }}
                  />

                  <View
                    style={{
                      flex: 1,
                      height: 40,
                      justifyContent: "center",
                      marginLeft: 10,
                    }}
                    onPress={this.onRefROI}
                  >
                    <Text
                      style={{ color: Constants.secondaryColor, fontSize: 17 }}
                    >
                      /lb
                    </Text>
                  </View>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 2,
                    }}
                  >
                    Default Sales Tax
                  </Text>
                  <InputOutLine
                    value={"" + (sales_tax ?? "")}
                    onChangeText={(val) => {
                      this.setState({
                        data: {
                          ...this.state.data,
                          sales_tax: val,
                        },
                      });
                    }}
                    icon={
                      <Text
                        style={{
                          color: Constants.secondaryColor,
                          fontSize: 17,
                        }}
                      >
                        %
                      </Text>
                    }
                    keyboardType={
                      Platform.OS == "android"
                        ? "default"
                        : "numbers-and-punctuation"
                    }
                    onSubmitEditing={() => {
                      this.updateSetting();
                    }}
                    style={{
                      flex: 2,
                      height: 34,
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                      borderColor: Constants.greyWhite,
                    }}
                  />

                  <View
                    style={{
                      flex: 1,
                      height: 40,
                      justifyContent: "center",
                      marginLeft: 10,
                    }}
                    onPress={this.onRefROI}
                  ></View>
                </View>

                <View style={styles.rowMain}>
                  <Text
                    style={{
                      fontSize: 15,
                      color: Constants.secondaryColor,
                      marginLeft: 5,
                      flex: 2,
                    }}
                  >
                    Prep Cost
                  </Text>
                  <InputOutLine
                    icon={
                      <Text
                        style={{
                          fontSize: 18,
                          color: Constants.secondaryColor,
                        }}
                      >
                        $
                      </Text>
                    }
                    value={"" + (prep_cost ?? "")}
                    onChangeText={(val) => {
                      this.setState({
                        data: {
                          ...this.state.data,
                          prep_cost: val,
                        },
                      });
                    }}
                    keyboardType={
                      Platform.OS == "android"
                        ? "default"
                        : "numbers-and-punctuation"
                    }
                    onSubmitEditing={() => {
                      this.updateSetting();
                    }}
                    style={{
                      flex: 2,
                      height: 34,
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                      borderColor: Constants.greyWhite,
                    }}
                  />

                  <View
                    style={{
                      flex: 1,
                      height: 40,
                      justifyContent: "center",
                      marginLeft: 10,
                    }}
                    onPress={this.onRefROI}
                  >
                    <Text
                      style={{
                        color: Constants.secondaryColor,
                        fontSize: 17,
                      }}
                    ></Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <ActionSheet
              title={"Keep History"}
              titleList={["for Last 30 Days", "for Last 90 Days"]}
              isShow={this.state.showKeepDaysPicker}
              onTapItem={(index, item) => {
                const newData = {
                  ...this.state.data,
                  keep_history: index == 0 ? 30 : 90,
                };
                this.setState(
                  { showKeepDaysPicker: false, data: newData },
                  () => {
                    this.updateSetting();
                  }
                );
              }}
              onCancel={() => {
                this.setState({ showKeepDaysPicker: false });
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
  const curRole = useSelector((state) => state.role.curRole);

  return (
    <Index
      navigation={navigation}
      route={route}
      dispatch={dispatch}
      curRole={curRole}
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
