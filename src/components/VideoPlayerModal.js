import React from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import Constants from "../utils/Constants";
import Ionicons from "react-native-vector-icons/Ionicons";

import VideoPlayer from "react-native-video-player";

const IconClose = (
  <Ionicons name="md-close-circle-outline" size={40} color="white" />
);

const VideoPlayerModal = ({ uri, src, onTapClose, isShow = false }) => {
  if (!isShow) {
    return null;
  }

  return (
    <Modal animationType={"fade"} transparent={true} visible={isShow}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: Constants.WINDOW_WIDTH,
          height: Constants.WINDOW_HEIGHT,
          backgroundColor: "rgba(13,13,13,0.4)",
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 40,
            right: 10,
            width: 40,
            height: 40,
            zIndex: 999,
            backgroundColor: Constants.opacityBlack,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            onTapClose();
          }}
        >
          {IconClose}
        </TouchableOpacity>
        <View
          style={{
            width: Constants.WINDOW_WIDTH,
            height: Constants.WINDOW_HEIGHT,
            backgroundColor: "black",
            borderRadius: 10,
            justifyContent: "center",
          }}
        >
          <VideoPlayer
            video={
              uri
                ? {
                    uri: uri,
                  }
                : src
            }
            videoWidth={Constants.WINDOW_WIDTH}
            videoHeight={Constants.WINDOW_WIDTH}
            resizeMode={"cover"}
            thumbnail={require("../../assets/city1.jpg")}
          />
        </View>
      </View>
    </Modal>
  );
};

export default VideoPlayerModal;
