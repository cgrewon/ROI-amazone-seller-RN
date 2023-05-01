import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Constants from "../utils/Constants";

const GradientButton = ({ style, title, onPress }) => (
  <TouchableOpacity
    style={{ ...style }}
    onPress={() => {
      if (onPress) {
        onPress();
      }
    }}
  >
    <LinearGradient
      colors={[Constants.lightGold, Constants.darkGold]}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
      }}
    >
      <Text
        style={{
          color: Constants.checkoutBackDark,
          fontSize: style.fontSize || 18,
        }}
      >
        {title}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default GradientButton;
