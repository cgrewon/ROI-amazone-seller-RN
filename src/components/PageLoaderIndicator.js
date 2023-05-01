import React from "react";
import { Text, View, Dimensions } from "react-native";
import { BallIndicator } from "react-native-indicators";
import PropTypes from "prop-types";
import ProgressBar from "react-native-animated-progress";
const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const PageLoaderIndicator = ({
  isPageLoader = false,
  loaderStyle = "bar",
  barColor = "white",
  position = "top",
  style,
  text,
}) => {
  if (!isPageLoader) {
    return null;
  }

  if (loaderStyle == "bar") {
    let containerStyle =
      position == "top"
        ? {
            width: WINDOW_WIDTH,
            height: 4,
            position: "absolute",
            top: 0,
            left: 0,
            ...style,
            paddingHorizontal: 0,
          }
        : {
            width: WINDOW_WIDTH,
            height: 4,
            position: "absolute",
            bottom: 0,
            left: 0,
            ...style,
            paddingHorizontal: 0,
          };
    return (
      <View style={containerStyle}>
        <ProgressBar indeterminate backgroundColor={barColor} height={3} />
        <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
          {text}
        </Text>
      </View>
    );
  } else {
    let positionStyle =
      position == "top"
        ? {
            top: 0,
          }
        : {
            bottom: 0,
          };

    return (
      <View
        style={{
          position: "absolute",
          ...positionStyle,
          left: 0,
          width: WINDOW_WIDTH,
          height: WINDOW_HEIGHT,
          backgroundColor: "rgba(13,13,13,0.4)",
          zIndex: 9999999,
          justifyContent: "center",
          alignItems: "center",
          ...style,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flex: 0, height: 50 }}>
          <BallIndicator color={"white"} />
        </View>
        <Text style={{ color: "white", fontSize: 14, textAlign: "center" }}>
          {text}
        </Text>
      </View>
    );
  }
};

PageLoaderIndicator.propTypes = {
  isPageLoader: PropTypes.bool,
};

PageLoaderIndicator.defaultProps = {
  isPageLoader: false,
};

export default PageLoaderIndicator;
