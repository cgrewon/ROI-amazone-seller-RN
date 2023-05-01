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
class Signup extends React.Component {
  _uid = "";

  _fnameRef = React.createRef();
  _emailRef = React.createRef();
  _pwdRef = React.createRef();
  _rpwdRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      fname: "",
      email: "",
      pwd: "",
      rpwd: "",

      fnameErrMessage: null,
      fnameValidMessage: null,
      emailErrMessage: null,
      emailValidMessage: null,
      pwdValidMessage: null,
      pwdInvalidMessage: null,
      rpwdValidMessage: null,
      rpwdInvalidMessage: null,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this._uid = DeviceInfo.getUniqueId();
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
    const { fname, email, pwd, rpwd } = this.state;
    if (!fname) {
      Alert.alert("Input Error", "Input full name.");
      return false;
    }
    if (!email) {
      Alert.alert("Input Error", "Input email.");
      return false;
    }
    if (!pwd) {
      Alert.alert("Input Error", "Input password.");
      return false;
    }
    if (!rpwd) {
      Alert.alert("Input Error", "Input confirm password.");
      return false;
    }
    if (pwd != rpwd) {
      Alert.alert("Input Error", "Confirm password does not match the password.");
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

  gotoMWSSetup = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Alert", `Don't know how to open this URL: ${url}`);
    }  
  }

  onTapContinue = () => {
    if (!this.validation()) {
      return;
    }

    this.signup(this.state.fname, this.state.email, this.state.pwd, this._uid);
  };

  signup = (fullname, user_email, password, device_id) => {
    const { navigation, route } = this.props;
    showPageLoader(true);
    let data = {
      api_version: 1,
      fullname: fullname,
      user_email: user_email,
      password: password,
      device_id: device_id,
    };

    RestAPI.generalPost("app/register", data)
      .then(async (res) => {
        showPageLoader(false);
        if (parseInt(res?.status)) {
          this.gotoMWSSetup(res?.url);
          navigation.navigate("login");
        }
      })
      .catch((err) => {
        showPageLoader(false);
        Alert.alert("Failed", err.message);
      });
  };
  onTapLogin = () => {
    const { navigation, route } = this.props;
    navigation.navigate("login");
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
                <View style={styles.buttonView}>
                  <InputOutLine
                    ref={this._fnameRef}
                    style={{
                      backgroundColor: Constants.white,
                      color: Constants.primaryColor,
                    }}
                    placeholder={"Full name"}
                    placeholderTextColor={Constants.greyWhite}
                    onChangeText={(val) => {
                      this.setState({ fname: val });
                    }}
                    errorMessage={this.state.fnameErrMessage}
                    successMessage={this.state.fnameValidMessage}
                    value={this.state.fname}
                    onSubmitEditing={() => {
                      this._emailRef.current.focus();
                    }}
                  />
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
                      this._rpwdRef.current.focus();
                    }}
                  />
                  <InputOutLine
                    ref={this._rpwdRef}
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
                    placeholder={"Confirm Password"}
                    placeholderTextColor={Constants.greyWhite}
                    onChangeText={(val) => {
                      this.setState({ rpwd: val });
                    }}
                    errorMessage={this.state.rpwdInvalidMessage}
                    successMessage={this.state.rpwdValidMessage}
                    value={this.state.rpwd}
                    secureTextEntry={true}
                    onSubmitEditing={() => {
                      this.onTapContinue();
                    }}
                  />
                  <FillButton
                    title={"Sign Up"}
                    style={{ marginTop: 10 }}
                    onPress={this.onTapContinue}
                  />
                  <TouchableOpacity
                    style={{
                      marginTop: 30,
                    }}
                    onPress={this.onTapLogin}
                  >
                    <Text
                      style={{
                        color: Constants.googleColor,
                        fontSize: 15,
                        textAlign: "center",
                      }}
                    >
                      Already have an account? Login{"\n"}
                    </Text>
                  </TouchableOpacity>
                </View>
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
    <Signup
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
