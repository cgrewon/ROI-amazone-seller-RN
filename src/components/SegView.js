import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { ToggleButton } from "./Buttons";

import PropTypes from "prop-types";
import Constants from "../utils/Constants";

const SegViews = ({ curIndex, titleList, onTapItem }) => {
  const height = 36;
  const [curItemIndex, setCurItemIndex] = useState(curIndex);

  useEffect(() => {
    setCurItemIndex(curIndex);
  }, [curIndex]);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 5,
        borderWidth: 0,
        marginVertical: 5,
      }}
    >
      {titleList.map((one, index) => {
        let itemStyle = {};
        if (curIndex == index) {
          itemStyle = {
            borderWidth: 0,
            backgroundColor: Constants.green,
            borderRadius: height / 2,
            color: Constants.white,
          };
        } else {
          itemStyle = {
            borderWidth: 0.5,
            borderColor: Constants.green,
            backgroundColor: Constants.white,
            borderRadius: height / 2,
            color: Constants.secondary,
          };
        }

        return (
          <ToggleButton
            key={"" + index}
            title={one}
            selected={curItemIndex == index}
            style={{
              flex: 1,
              height: height,
              ...itemStyle,
              marginHorizontal: 5,
            }}
            onPress={() => {
              setCurItemIndex(index);
              if (onTapItem) {
                onTapItem(one, index);
              }
            }}
          />
        );
      })}
    </View>
  );
};

SegViews.propTypes = {
  curIndex: PropTypes.number,
  titleList: PropTypes.array,
  onTapItem: PropTypes.func,
};

SegViews.defaultProps = {
  curIndex: 0,
  titleList: [],
  onTapItem: (item, index) => {},
};

export default SegViews;
