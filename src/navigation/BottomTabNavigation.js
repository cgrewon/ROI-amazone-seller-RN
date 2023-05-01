import * as React from "react";
import { Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import Constants from "../utils/Constants";

import Search from "../pages/tabPages/search/index";
import History from "../pages/tabPages/history/index";
import Scan from "../pages/tabPages/scan/index";
import Setting from "../pages/tabPages/setting/index";

const HomeTabList = ["Search", "History", "Scan", "Setting"];
const TabRouteNameList = ["search", "history", "scan", "setting"];

import { useNavigation, useRoute } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const MenuIconSelList = [
  <Feather name="search" size={25} color={Constants.green} />,
  <Feather name="clock" size={25} color={Constants.green} />,
  <Ionicons name="barcode-outline" size={30} color={Constants.green} />,
  <Feather name="settings" size={25} color={Constants.green} />,
];

const MenuIconList = [
  <Feather name="search" size={25} color={Constants.greyWhite} />,
  <Feather name="clock" size={25} color={Constants.greyWhite} />,

  <Ionicons name="barcode-outline" size={30} color={Constants.greyWhite} />,
  <Feather name="settings" size={25} color={Constants.greyWhite} />,
];

class BottomTabNavigation extends React.Component {
  state = {
    badgeCount: 0,
  };
  getNotificationCount = () => {};

  componentDidMount() {
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener("focus", () => {});

    this._unsubscribeBlur = navigation.addListener("blur", () => {
      global.updateBadgeCount = null;
      global.tabNotiLoadFunc = null;
    });
  }

  componentWillUnmount() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._unsubscribeBlur) {
      this._unsubscribeBlur();
    }
  }

  render() {
    const tabList = HomeTabList;
    const routeList = TabRouteNameList;

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          title: ({ focused, color, size }) => {
            return null;
          },
          tabBarIcon: ({ focused, color, size }) => {
            let icon = null;
            routeList.forEach((title, index) => {
              if (route.name == title) {
                if (focused) {
                  icon = MenuIconSelList[index];
                } else {
                  icon = MenuIconList[index];
                }
              }
            });
            return icon;
          },
        })}
        tabBarOptions={{
          activeTintColor: Constants.green,
          inactiveTintColor: Constants.greyWhite,
          activeBackgroundColor: Constants.white,
          inactiveBackgroundColor: Constants.white,
          labelStyle: {
            fontSize: 13,
          },
          style: {
            backgroundColor: Constants.white,
          },
        }}
        initialRouteName={routeList[0]}
      >
        <Tab.Screen name={routeList[0]} component={Search} />
        <Tab.Screen name={routeList[1]} component={History} />
        <Tab.Screen name={routeList[2]} component={Scan} />
        <Tab.Screen name={routeList[3]} component={Setting} />
      </Tab.Navigator>
    );
  }
}

export default function (props) {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const curRole = useSelector((state) => state.role.curRole);

  return (
    <BottomTabNavigation
      {...props}
      navigation={navigation}
      route={route}
      dispatch={dispatch}
      curRole={curRole}
    />
  );
}
