import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { RNCamera } from "react-native-camera";
import Constants from "../../../utils/Constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
class BarcodeScan extends Component {
  _isCaptured = false;
  constructor(props) {
    super(props);
    this.state = {
      flashStatus: RNCamera.Constants.FlashMode.off,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;

    this._unsub = navigation.addListener("focus", () => {
      this._isCaptured = false;
    });
  }
  componentWillUnmount() {
    this._unsub();
  }

  setCaptured = (value) => {
    this._isCaptured = value;
  };

  onBarCodeRead = (data) => {
    if (this._isCaptured || (data && data[0] == "{")) {
      return;
    }
    this._isCaptured = true;
    if (this.props.onBarCodeRead) {
      this.props.onBarCodeRead(data);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
          flashMode={this.state.flashStatus}
          onBarCodeRead={(res) => {
            this.onBarCodeRead(res?.data);
          }}
          androidCameraPermissionOptions={{
            title: "Permission to use camera",
            message: "We need your permission to use your camera",
            buttonPositive: "Ok",
            buttonNegative: "Cancel",
          }}
          onGoogleVisionBarcodesDetected={({ barcodes }) => {
            if (barcodes && barcodes.length > 0) {
              const asin = barcodes[0].data ?? "";
              this.onBarCodeRead(asin);
            }
          }}
        />

        <View
          style={{
            position: "absolute",
            width: Constants.WINDOW_WIDTH * 0.85,
            height: Constants.WINDOW_WIDTH * 0.55,
            borderColor: Constants.lightGreen,
            borderWidth: 2,
            borderRadius: 8,
            top:
              (Constants.WINDOW_HEIGHT - Constants.WINDOW_WIDTH * 0.5) / 2 - 60,
            left: Constants.WINDOW_WIDTH * 0.07,
          }}
        ></View>
        <TouchableOpacity
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            top: 10,
            right: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            let newStatus =
              this.state.flashStatus == RNCamera.Constants.FlashMode.off
                ? RNCamera.Constants.FlashMode.torch
                : RNCamera.Constants.FlashMode.off;
            this.setState({ flashStatus: newStatus });
          }}
        >
          <Feather
            name={
              this.state.flashStatus == RNCamera.Constants.FlashMode.off
                ? "zap-off"
                : "zap"
            }
            size={25}
            color={Constants.green}
          />
        </TouchableOpacity>
      </View>
    );
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  };
}

export default index = React.forwardRef((props, ref) => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <BarcodeScan ref={ref} {...props} navigation={navigation} route={route} />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Constants.WINDOW_WIDTH,
    flexDirection: "column",
    backgroundColor: "black",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  capture: {
    flex: 0,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
    margin: 20,
  },
});
