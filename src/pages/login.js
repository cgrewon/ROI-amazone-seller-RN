import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";
import { useNavigation, useRoute } from "@react-navigation/native";

import Constants from "../utils/Constants";
import Utils from "../utils/Utils";

const logoImage = require("../../assets/logo.png");

import { useDispatch, useSelector } from "react-redux";
import { updateSetting } from "../store/actions";

import { FillButton } from "../components/Buttons";

import { InputOutLine } from "../components/Inputs";
import DeviceInfo from "react-native-device-info";

import RestAPI, { xhr } from "../utils/RestAPI";
class Login extends React.Component {
  _uid = "";

  _emailRef = React.createRef();
  _pwdRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      pwd: "",

      emailErrMessage: null,
      emailValidMessage: null,
      pwdValidMessage: null,
      pwdInvalidMessage: null,
      isShowLoginBox: false,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this._uid = DeviceInfo.getUniqueId();

    this._focus = navigation.addListener("focus", () => {
      this.curUserCheck();
    });
  }

  componentWillUnmount() {
    if (this._focus) {
      this._focus();
    }
  }

  loadSetting = (userID, callBack) => {
    const { dispatch } = this.props;

    const data = {
      api_version: 1,
      user_id: userID,
    };

    showPageLoader(true);
    RestAPI.generalPost("app/get_settings", data)
      .then((res) => {
        showPageLoader(false);
        if (res?.status == 1) {
          dispatch(updateSetting(res.data));
          console.log(
            "At login : setting store update>> ",
            JSON.stringify(res.data, null, 2)
          );
          callBack(true);
        } else {
          Alert.alert("Failed to get settings", res.message);
          callBack(false);
        }
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
        callBack(false);
      });
  };

  curUserCheck = async () => {
    global.curUser = await Utils.getCurUser();

    if (global.curUser) {
      this.login(
        global.curUser.access.user_email,
        global.curUser.access.password,
        this._uid
      );
    } else {
      this.setState({ isShowLoginBox: true });
    }
  };

  validation = () => {
    const { email, pwd } = this.state;
    if (!email) {
      Alert.alert("Input Error", "Input email.");
      return false;
    }
    if (!pwd) {
      Alert.alert("Input Error", "Input password.");
      return false;
    }
    if (!this._uid) {
      Alert.alert(
        "Error",
        "Failed to get device id, please try again after a moment."
      );
      return false;
    }

    return true;
  };

  onTapContinue = () => {
    if (!this.validation()) {
      return;
    }

    this.login(this.state.email, this.state.pwd, this._uid);
  };

  login = (user_email, password, device_id) => {
    const { navigation, route } = this.props;
    showPageLoader(true);
    let data = {
      api_version: 1,
      user_email: user_email,
      password: password,
      device_id: device_id,
    };

    RestAPI.generalPost("app/login", data)
      .then(async (res) => {
        showPageLoader(false);
        const userId = res?.info?.id ?? "";
        global.curUser = {
          id: userId,
          device_id: this._uid,
          ...res?.info,
          access: data,
        };
        await Utils.saveCurUser(global.curUser);

        this.loadSetting(userId, (loadedSetting) => {
          navigation.navigate("bottom_tab");
        });
      })
      .catch((err) => {
        showPageLoader(false);
        this.setState({ isShowLoginBox: true });
        Alert.alert("Failed", err.message);
      });
  };

  onTapSignUp = () => { //async 
    const { navigation, route } = this.props;
    navigation.navigate("signup");

    /*let url = "https://www.roiscanner.com";

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Alert", `Don't know how to open this URL: ${url}`);
    }*/
  };

  render() {
    return (
      <>
        <SafeAreaView
          style={{
            flex: 0,
            backgroundColor: Constants.backColor,
          }}
        ></SafeAreaView>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar
            backgroundColor={Constants.backColor}
            barStyle={"dark-content"}
          />
          <View style={styles.container}>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContentContainer}
            >
              <Image
                style={styles.logoImage}
                source={logoImage}
                resizeMode="contain"
              />
              {this.state.isShowLoginBox && (
                <View style={styles.buttonView}>
                  <InputOutLine
                    ref={this._emailRef}
                    icon={
                      <Feather
                        name="mail"
                        size={20}
                        color={Constants.secondaryColor}
                      />
                    }
                    style={{
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                    }}
                    placeholder={"User name or email"}
                    placeholderTextColor={Constants.greyWhite}
                    onChangeText={(val) => {
                      this.setState({ email: val });
                    }}
                    errorMessage={this.state.emailErrMessage}
                    successMessage={this.state.emailValidMessage}
                    value={this.state.email}
                    keyboardType={"email-address"}
                    onSubmitEditing={() => {
                      this._pwdRef.current.focus();
                    }}
                  />

                  <InputOutLine
                    ref={this._pwdRef}
                    icon={
                      <Feather
                        name="lock"
                        size={20}
                        color={Constants.secondaryColor}
                      />
                    }
                    style={{
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                    }}
                    placeholder={"Password"}
                    placeholderTextColor={Constants.greyWhite}
                    onChangeText={(val) => {
                      this.setState({ pwd: val });
                    }}
                    errorMessage={this.state.pwdInvalidMessage}
                    successMessage={this.state.pwdValidMessage}
                    value={this.state.pwd}
                    secureTextEntry={true}
                    onSubmitEditing={() => {
                      this.onTapContinue();
                    }}
                  />
                  <FillButton
                    title={"Log In"}
                    style={{ marginTop: 10 }}
                    onPress={this.onTapContinue}
                  />
                  <TouchableOpacity
                    style={{
                      marginTop: 30,
                    }}
                    onPress={this.onTapSignUp}
                  >
                    <Text
                      style={{
                        color: Constants.googleColor,
                        fontSize: 15,
                        textAlign: "center",
                      }}
                    >
                      Don't have an account? Sign up{"\n"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
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
  const setting = useSelector((state) => state.setting.settingData);

  return (
    <Login
      navigation={navigation}
      route={route}
      dispatch={dispatch}
      setting={setting}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.backColor,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  logoImage: {
    width: Constants.WINDOW_WIDTH * 0.4,
    height: Constants.WINDOW_WIDTH * 0.4,
    resizeMode: "contain",
    marginTop: 10,
  },
  buttonView: {
    marginTop: 80,
    borderRadius: 20,
    backgroundColor: Constants.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "100%",
  },

  scrollContainer: {
    flex: 1,
    marginTop: 60,
  },
  scrollContentContainer: {
    width: Constants.WINDOW_WIDTH - 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
